import numpy as np
from scipy.interpolate import UnivariateSpline, PPoly
from collections import defaultdict
from enum import Enum, auto
import random


class ResolutionStrategy(str, Enum):
    OPTIMISTIC = "optimistic"
    PESSIMISTIC = "pessimistic"
    RANDOM = "random"
    CUSTOM = "custom"
    ASAP = "asap"


class ThresholdModel:
    def __init__(
        self,
        preferences,
        resolution_strategy=ResolutionStrategy.PESSIMISTIC,
        min_percentage=0.0,
    ):
        """
        Initialize with a list of (name, threshold) tuples.
        Thresholds can be fractions [0, 1] or absolute counts [0, N].
        If any finite threshold > 1.0, the model assumes absolute counts (N domain).
        Otherwise, it assumes fractions (0-1 domain).
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
        Auto-detects if thresholds are fractions or absolute counts.
        """
        if not self.preferences:
            return np.array([0.0, 1.0]), np.array([0.0, 0.0]), False, 1.0

        n = len(self.preferences)
        thresholds = [p[1] for p in self.preferences]
        
        # Detect if absolute or fractional
        finite_thresholds_all = [t for t in thresholds if t != float('inf')]
        max_t = max(finite_thresholds_all) if finite_thresholds_all else 0
        
        # If any threshold > 1.0, treat as absolute counts
        is_absolute = max_t > 1.0
        
        # Determine domain maximum
        # If absolute, domain goes up to N (total population/activity)
        # If fractional, domain goes up to 1.0
        domain_max = float(n) if is_absolute else 1.0

        # Filter thresholds relevant to the domain
        # Thresholds > domain_max are effectively unreachable/infinite
        finite_thresholds = [t for t in thresholds if t <= domain_max]
        unique_thresholds = sorted(list(set(finite_thresholds)))

        x_points = []
        y_points = []

        # Start at 0
        if not unique_thresholds or unique_thresholds[0] > 0:
            x_points.append(0.0)
            y_points.append(0.0)

        cum_count = 0
        for t in unique_thresholds:
            count = finite_thresholds.count(t)
            cum_count += count
            
            # Y value:
            # If absolute mode, y is count [0, N]
            # If fractional mode, y is fraction [0, 1]
            y_val = cum_count if is_absolute else (cum_count / n)
            
            x_points.append(t)
            y_points.append(y_val)

        # Ensure we cover up to domain_max
        if not x_points or x_points[-1] < domain_max:
            x_points.append(domain_max)
            last_y = y_points[-1] if y_points else 0.0
            y_points.append(last_y)

        return np.array(x_points), np.array(y_points), is_absolute, domain_max

    def _get_spline(self, smoothing=None):
        x, y, is_absolute, domain_max = self._get_curve_data()

        if len(x) < 2:
            return None, x, y, 1, is_absolute, domain_max

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
        return UnivariateSpline(x, y, k=k, s=smoothing), x, y, k, is_absolute, domain_max

    def find_equilibria(self, smoothing=None):
        """
        Find stable and unstable equilibria.
        """
        spline, x, y, k, is_absolute, domain_max = self._get_spline(smoothing)

        if spline is None:
            return {"stable": [], "unstable": []}

        # Find roots of spline(x) - x = 0
        diff_spline = UnivariateSpline(x, y - x, k=k, s=smoothing)
        pp = PPoly.from_spline(diff_spline._eval_args)
        roots = pp.roots()

        # Filter roots to be in valid domain
        valid_roots = [r for r in roots if 0 <= r <= domain_max]

        equilibria = {"stable": [], "unstable": []}

        for r in valid_roots:
            slope = spline.derivatives(r)[1]
            
            # Group logic depends on threshold comparison
            group = [p[0] for p in self.preferences if p[1] <= r + 1e-9]

            entry = (float(r), group)

            if slope < 1:
                equilibria["stable"].append(entry)
            else:
                equilibria["unstable"].append(entry)

        equilibria["stable"].sort(key=lambda x: x[0])
        equilibria["unstable"].sort(key=lambda x: x[0])

        return equilibria

    def has_equilibrium_above_min(self, smoothing=None):
        """
        Check if there is any equilibrium strictly above min_percentage.
        Handles adaptation of min_percentage to domain.
        """
        eqs = self.find_equilibria(smoothing)
        
        # We need access to domain info here, but it's not returned by find_equilibria.
        # Re-calling get_curve_data is cheap or we can infer.
        # Easier: get domain max from get_spline
        _, _, _, _, is_absolute, domain_max = self._get_spline(smoothing)
        
        min_val = self.min_percentage
        if is_absolute:
            # If in absolute mode, min_percentage is fraction of N
            min_val = self.min_percentage * domain_max
            
        for r, _ in eqs["stable"] + eqs["unstable"]:
            if r > min_val:
                return True
        return False

    def resolve(self, custom_seed=None, smoothing=None):
        """
        Resolve the final active set using analytical equilibria.
        """
        if not self.preferences:
            return []

        spline, x, y, _, is_absolute, domain_max = self._get_spline(smoothing)
        if spline is None:
            return []
            
        # Calculate min_val for current domain
        min_val = self.min_percentage
        if is_absolute:
            min_val = self.min_percentage * domain_max

        # Determine start point
        start_p = 0.0
        if self.resolution_strategy == ResolutionStrategy.PESSIMISTIC:
            start_p = min_val
        elif self.resolution_strategy == ResolutionStrategy.OPTIMISTIC:
            start_p = domain_max
        elif self.resolution_strategy == ResolutionStrategy.RANDOM:
            start_p = random.uniform(min_val, domain_max)
        elif self.resolution_strategy == ResolutionStrategy.CUSTOM:
            if custom_seed is None:
                raise ValueError("custom_seed must be provided for CUSTOM strategy")
            start_p = float(custom_seed)
            if start_p < min_val:
                start_p = min_val
            # Note: custom_seed is assumed to be in correct units (fraction or count)

        eqs = self.find_equilibria(smoothing)
        all_eqs = sorted(eqs["stable"] + eqs["unstable"], key=lambda x: x[0])

        if not all_eqs:
            # Fallback: check midpoint relative to domain
            mid = domain_max / 2.0
            val_at_mid = spline(mid)
            final_p = domain_max if val_at_mid > mid else 0.0
            group = [p[0] for p in self.preferences if p[1] <= final_p + 1e-9]
            return group

        current_val = spline(start_p)
        final_eq_p = start_p

        if abs(current_val - start_p) < 1e-4:
            final_eq_p = start_p
        elif current_val > start_p:
            # Flow UP
            candidates = [r for r, _ in all_eqs if r >= start_p - 1e-4]
            if candidates:
                final_eq_p = candidates[0]
            else:
                final_eq_p = domain_max
        else:
            # Flow DOWN
            candidates = [r for r, _ in all_eqs if r <= start_p + 1e-4]
            if candidates:
                final_eq_p = candidates[-1]
            else:
                final_eq_p = 0.0

        # Apply floor
        if final_eq_p < min_val:
            final_eq_p = min_val

        active_names = [p[0] for p in self.preferences if p[1] <= final_eq_p + 1e-9]
        return active_names
