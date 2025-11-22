import numpy as np
import matplotlib.pyplot as plt
from scipy.interpolate import UnivariateSpline
from collections import defaultdict
from enum import Enum, auto
import random


class ResolutionStrategy(Enum):
    OPTIMISTIC = auto()
    PESSIMISTIC = auto()
    RANDOM = auto()
    CUSTOM = auto()


class ThresholdModel:
    def __init__(
        self,
        preferences,
        resolution_strategy=ResolutionStrategy.PESSIMISTIC,
        min_percentage=0.0,
    ):
        """
        Initialize with a list of (name, threshold) tuples.
        Thresholds should be floats in [0, 1] or float('inf').
        resolution_strategy: ResolutionStrategy enum member.
        min_percentage: float in [0, 1], the minimum active percentage.
        """
        self.preferences = []
        for name, threshold in preferences:
            self.preferences.append((name, float(threshold)))
        self._sort_preferences()

        # Immutable configuration
        self._resolution_strategy = resolution_strategy
        self._min_percentage = float(min_percentage)

    @property
    def resolution_strategy(self):
        return self._resolution_strategy

    @property
    def min_percentage(self):
        return self._min_percentage

    def _sort_preferences(self):
        """Sort preferences by threshold, infinity last."""
        self.preferences.sort(key=lambda x: x[1])

    def sort(self):
        """Return the sorted list of preferences."""
        return list(self.preferences)

    def add_preference(self, name, threshold):
        """Add a new preference and re-sort."""
        self.preferences.append((name, float(threshold)))
        self._sort_preferences()

    def remove_preference(self, name):
        """Remove a preference by name (removes first occurrence)."""
        for i, (n, t) in enumerate(self.preferences):
            if n == name:
                self.preferences.pop(i)
                break

    def update_preference(self, name, new_threshold):
        """Update a preference's threshold and re-sort."""
        found = False
        for i, (n, t) in enumerate(self.preferences):
            if n == name:
                self.preferences[i] = (name, float(new_threshold))
                found = True
                break
        if found:
            self._sort_preferences()
        else:
            raise ValueError(f"Name '{name}' not found in preferences.")

    def _get_curve_data(self):
        """
        Generate points (x, y) for the social behavior curve.
        x: percentage of others doing it
        y: percentage of people willing to do it
        """
        if not self.preferences:
            return np.array([0.0, 1.0]), np.array([0.0, 0.0])

        n = len(self.preferences)
        thresholds = [p[1] for p in self.preferences]

        # Filter out infinities for the curve generation (they are effectively > 1)
        finite_thresholds = [t for t in thresholds if t <= 1.0]

        # Unique thresholds and their cumulative counts
        unique_thresholds = sorted(list(set(finite_thresholds)))

        x_points = []
        y_points = []

        # Always start at 0.
        # If there are thresholds at exactly 0, y starts at count(0)/n.
        # If not, y starts at 0.

        # If min threshold > 0, we need a point at (0, 0)
        if not unique_thresholds or unique_thresholds[0] > 0:
            x_points.append(0.0)
            y_points.append(0.0)

        cum_count = 0
        for t in unique_thresholds:
            count = finite_thresholds.count(t)
            cum_count += count
            # Point: at percentage t, fraction cum_count/n are willing
            x_points.append(t)
            y_points.append(cum_count / n)

        # Ensure we cover up to 1.0
        if not x_points or x_points[-1] < 1.0:
            x_points.append(1.0)
            # The y value stays constant after the last finite threshold
            last_y = y_points[-1] if y_points else 0.0
            y_points.append(last_y)

        return np.array(x_points), np.array(y_points)

    def _get_spline(self, smoothing=None):
        x, y = self._get_curve_data()

        if len(x) < 2:
            return None, x, y, 1

        # Deduplicate x
        if len(x) != len(set(x)):
            unique_x = []
            unique_y = []
            for i in range(len(x)):
                if i == 0 or x[i] > x[i - 1]:
                    unique_x.append(x[i])
                    unique_y.append(y[i])
                else:
                    unique_y[-1] = max(unique_y[-1], y[i])
            x, y = np.array(unique_x), np.array(unique_y)

        k = 3 if len(x) > 3 else 1
        return UnivariateSpline(x, y, k=k, s=smoothing), x, y, k

    def find_equilibria(self, smoothing=None):
        """
        Find stable and unstable equilibria.
        Returns a dict with 'stable' and 'unstable' keys containing lists of
        (equilibrium_percentage, [list_of_names]).
        """
        spline, x, y, k = self._get_spline(smoothing)

        if spline is None:
            return {"stable": [], "unstable": []}

        # Find roots of spline(x) - x = 0
        diff_spline = UnivariateSpline(x, y - x, k=k, s=smoothing)
        roots = diff_spline.roots()

        # Filter roots to be in [0, 1]
        valid_roots = [r for r in roots if 0 <= r <= 1.0]

        # Check endpoints explicitly if they are close to equilibrium
        # (Spline roots might occasionally miss exact 0 or 1 if curvature is high)
        # But typically roots() finds them.

        equilibria = {"stable": [], "unstable": []}

        for r in valid_roots:
            # Determine stability: slope of CDF at r.
            # Stable if slope < 1 (crossing from above to below).
            # Unstable if slope > 1.
            slope = spline.derivatives(r)[1]

            # Get the group of people
            # People with threshold <= r
            group = [p[0] for p in self.preferences if p[1] <= r + 1e-9]

            entry = (float(r), group)

            if slope < 1:
                equilibria["stable"].append(entry)
            else:
                equilibria["unstable"].append(entry)

        # Sort by percentage
        equilibria["stable"].sort(key=lambda x: x[0])
        equilibria["unstable"].sort(key=lambda x: x[0])

        return equilibria

    def has_equilibrium_above_min(self, smoothing=None):
        """
        Check if there is any equilibrium strictly above min_percentage.
        """
        eqs = self.find_equilibria(smoothing)
        for r, _ in eqs["stable"] + eqs["unstable"]:
            if r > self.min_percentage:
                return True
        return False

    def resolve(self, custom_seed=None, smoothing=None):
        """
        Resolve the final active set using analytical equilibria.
        1. Determine start point based on strategy.
        2. Find the attractor (stable equilibrium) for that start point.
        Returns the list of active names at that equilibrium.
        """
        if not self.preferences:
            return []

        # Determine start percentage
        start_p = 0.0
        if self.resolution_strategy == ResolutionStrategy.PESSIMISTIC:
            start_p = self.min_percentage
        elif self.resolution_strategy == ResolutionStrategy.OPTIMISTIC:
            start_p = 1.0
        elif self.resolution_strategy == ResolutionStrategy.RANDOM:
            start_p = random.uniform(self.min_percentage, 1.0)
        elif self.resolution_strategy == ResolutionStrategy.CUSTOM:
            if custom_seed is None:
                raise ValueError("custom_seed must be provided for CUSTOM strategy")
            start_p = max(self.min_percentage, float(custom_seed))

        # Get spline to evaluate flow
        spline, x, y, _ = self._get_spline(smoothing)
        if spline is None:
            # Trivial case: everyone or no one based on simple logic
            # Fallback to simple check
            return []

        # Get all roots (both stable and unstable)
        eqs = self.find_equilibria(smoothing)
        all_eqs = sorted(eqs["stable"] + eqs["unstable"], key=lambda x: x[0])

        # If no equilibria found (rare, usually 0 or 1 are equilibria),
        # check endpoints manually or fallback to simulation logic?
        # But with (0,0) and (1,1) bounds, there's usually an intersection.
        if not all_eqs:
            # This implies the curve is entirely above or below y=x
            # If curve > x always -> goes to 1.0
            # If curve < x always -> goes to 0.0
            val_at_05 = spline(0.5)
            final_p = 1.0 if val_at_05 > 0.5 else 0.0
            group = [p[0] for p in self.preferences if p[1] <= final_p + 1e-9]
            return group

        # Logic:
        # If spline(start_p) > start_p: flow UP to next root
        # If spline(start_p) < start_p: flow DOWN to next root
        # If spline(start_p) == start_p: stay there

        current_val = spline(start_p)

        final_eq_p = start_p

        if abs(current_val - start_p) < 1e-4:
            # Already at equilibrium
            final_eq_p = start_p
        elif current_val > start_p:
            # Flow UP: find smallest root >= start_p
            # Note: We need a stable one? Or just the next crossing?
            # The dynamic process stops at the first crossing it hits.
            # If it hits an unstable equilibrium from below, it technically stops there
            # (though sensitive to noise). But mathematically, f(x)=x stops the flow.

            # Find first root > start_p
            candidates = [r for r, _ in all_eqs if r >= start_p - 1e-4]
            if candidates:
                final_eq_p = candidates[0]
            else:
                final_eq_p = 1.0  # Should have been caught by roots, but just in case
        else:
            # Flow DOWN: find largest root <= start_p
            candidates = [r for r, _ in all_eqs if r <= start_p + 1e-4]
            if candidates:
                final_eq_p = candidates[-1]
            else:
                final_eq_p = 0.0

        # However, we must respect min_percentage as a hard floor?
        # If the "flow" wants to go below min_percentage, it stops at min_percentage?
        # Or does min_percentage just define the start?
        # The user said "min percentage becomes zero... taken from there".
        # This implies it's a floor.
        if final_eq_p < self.min_percentage:
            # If natural equilibrium is below min, we are forced to min_percentage?
            # Or does min_percentage act as a barrier?
            # If f(min) < min, we want to flow down, but we are forced at min.
            # So we stop at min.
            final_eq_p = self.min_percentage

        # Return active set at this final percentage
        active_names = [p[0] for p in self.preferences if p[1] <= final_eq_p + 1e-9]
        return active_names

    def display(self, smoothing=None):
        """
        Plot the social behavior curve and equilibria using matplotlib.
        """
        x_data, y_data = self._get_curve_data()

        # Re-create spline for plotting
        # Handle duplicates again just in case
        unique_x = []
        unique_y = []
        for i in range(len(x_data)):
            if i == 0 or x_data[i] > x_data[i - 1]:
                unique_x.append(x_data[i])
                unique_y.append(y_data[i])
            else:
                unique_y[-1] = max(unique_y[-1], y_data[i])

        x_clean, y_clean = np.array(unique_x), np.array(unique_y)
        k = 3 if len(x_clean) > 3 else 1
        spline = UnivariateSpline(x_clean, y_clean, k=k, s=smoothing)

        x_plot = np.linspace(0, 1, 200)
        y_plot = spline(x_plot)

        # Ensure clamped to [0, 1] conceptually, though spline might overshoot
        y_plot = np.clip(y_plot, 0, 1)

        plt.figure(figsize=(8, 6))
        plt.plot(x_plot, y_plot, "r-", label="Social Behavior Curve")
        plt.plot([0, 1], [0, 1], "b--", label="Equilibrium Line (y=x)")

        # Find and plot equilibria
        eqs = self.find_equilibria(smoothing)

        for r, _ in eqs["stable"]:
            plt.plot(
                r,
                r,
                "go",
                markersize=8,
                label=(
                    "Stable"
                    if "Stable" not in plt.gca().get_legend_handles_labels()[1]
                    else ""
                ),
            )
            plt.annotate(
                f"{r:.2f}",
                (r, r),
                textcoords="offset points",
                xytext=(0, 10),
                ha="center",
            )

        for r, _ in eqs["unstable"]:
            plt.plot(
                r,
                r,
                "mo",
                markersize=8,
                label=(
                    "Unstable"
                    if "Unstable" not in plt.gca().get_legend_handles_labels()[1]
                    else ""
                ),
            )
            plt.annotate(
                f"{r:.2f}",
                (r, r),
                textcoords="offset points",
                xytext=(0, -15),
                ha="center",
            )

        plt.title("Social Behavior Threshold Model")
        plt.xlabel("Percentage of others doing X")
        plt.ylabel("Percentage willing to do X")
        plt.legend()
        plt.grid(True)
        plt.xlim([0, 1])
        plt.ylim([0, 1.05])
        plt.show()
