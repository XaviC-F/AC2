import numpy as np
from scipy.interpolate import UnivariateSpline
from enum import Enum, auto
from ac2_backend.core.commit_classes import CommitEncrypter, CommitDecrypter, NameHolder


class ResolutionStrategy(Enum):
    OPTIMISTIC = auto()
    PESSIMISTIC = auto()
    RANDOM = auto()
    CUSTOM = auto()


class ThresholdEncryptedModel:
    def __init__(
        self,
        preferences,
        resolution_strategy=ResolutionStrategy.PESSIMISTIC,
        min_percentage=0.0,
    ):
        """
        Initialize with a list of (name, threshold) tuples.
        The set of unique names in 'preferences' defines the server's privileged set N.
        
        resolution_strategy: Determines where the noise floor starts for encryption.
            PESSIMISTIC: Start assuming min_percentage is required (mapped to absolute count).
            Others: Default to min_count of 1.
        """
        self.preferences = []
        initial_names = set()
        
        # Initialize preferences list and capture unique names
        for name, threshold in preferences:
            val = float(threshold)
            self.preferences.append((name, val))
            initial_names.add(name)
        
        self.n_total = len(initial_names)
        self._sort_preferences()

        # Immutable configuration
        self._resolution_strategy = resolution_strategy
        
        # Convert min_percentage to absolute number for encryption floor
        self._min_percentage = float(min_percentage)
        self.min_count = max(1, int(self._min_percentage * self.n_total))
        if self._min_percentage > 0 and self.min_count == 0:
             self.min_count = 1

        # --- Encryption Scheme Setup ---
        self.names_map = sorted(list(initial_names))
        self.name_holder = NameHolder(self.names_map)
        
        # Initialize Encrypter and Decrypter
        # Encryption uses min_count to set the noise floor.
        self.encrypter = CommitEncrypter(self.name_holder, self.min_count)
        self.decrypter = CommitDecrypter(self.n_total)
        
        # Map to store current commitments (name -> threshold)
        self.commitments = {}
        
        # Re-play initial preferences as commitments
        for name, threshold in self.preferences:
             self.add_preference(name, threshold)

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
        """
        Submit a commitment.
        Returns (ciphertext, vector_of_points) as per the scheme.
        threshold: Absolute number of people required.
        """
        t_val = float(threshold)
        
        # Update internal state for tracking
        found = False
        for i, (n, t) in enumerate(self.preferences):
            if n == name:
                self.preferences[i] = (name, t_val)
                found = True
                break
        if not found:
            self.preferences.append((name, t_val))
            # Note: The encryption scheme works even if name was not in initial_names,
            # but CommitEncrypter will return noise if name is not in NameHolder.
        
        self._sort_preferences()
        self.commitments[name] = t_val
        
        # Perform Encryption
        # threshold -1 means never.
        thresh_int = int(t_val)
        ct, points = self.encrypter.commit(name, thresh_int)
        
        # Store in decrypter (server-side simulation of receiving data)
        # In a real system, this happens elsewhere.
        # We need to clear previous commitment from this user in decrypter?
        # The current CommitDecrypter just appends. 
        # For a model update, we should probably rebuild decrypter or handle updates.
        # Simplest: Rebuild Decrypter from current self.commitments state.
        self._rebuild_decrypter()
                
        return ct, points

    def remove_preference(self, name):
        """Remove a preference by name."""
        for i, (n, t) in enumerate(self.preferences):
            if n == name:
                self.preferences.pop(i)
                if name in self.commitments:
                    del self.commitments[name]
                break
        self._rebuild_decrypter()

    def update_preference(self, name, new_threshold):
        """Update a preference's threshold."""
        return self.add_preference(name, new_threshold)

    def _rebuild_decrypter(self):
        """Helper to refresh the decrypter state based on current commitments."""
        self.decrypter = CommitDecrypter(self.n_total)
        for name, t in self.commitments.items():
            # Re-generate commitment packet for the current state
            # (In reality, we would store the ciphertext/vec, but here we generate on fly for simulation)
            thresh_int = int(t)
            ct, points = self.encrypter.commit(name, thresh_int)
            self.decrypter.add_commitment(ct, points)

    def _get_curve_data(self):
        """
        Generate points (x, y) for the social behavior curve.
        x: Number of others doing it (Absolute) -> Converted to percentage for display if needed, 
           but user asked for absolute numbers in backend. 
           However, display() plots usually expect normalized 0..1 or raw counts.
           Let's stick to normalized 0..1 for the 'curve' visualization to keep it compatible with standard plots,
           or switch to counts.
           The prompt says "Change threshold_poly to use absolute numbers... Present the old interface".
           The old interface _get_curve_data returns x, y.
           If we return absolute counts, the visualizer (if external) might break.
           But 'display' is internal. We can update display to show counts.
        """
        if not self.preferences:
            return np.array([0, self.n_total]), np.array([0, 0])

        n = self.n_total
        thresholds = [p[1] for p in self.preferences]

        # Filter valid thresholds (<= n)
        finite_thresholds = [t for t in thresholds if 0 <= t <= n]

        unique_thresholds = sorted(list(set(finite_thresholds)))

        x_points = []
        y_points = []

        # Start at 0
        if not unique_thresholds or unique_thresholds[0] > 0:
            x_points.append(0)
            y_points.append(0)

        cum_count = 0
        for t in unique_thresholds:
            count = finite_thresholds.count(t)
            cum_count += count
            x_points.append(t)
            y_points.append(cum_count) # Absolute count of willing people

        # Ensure we cover up to n
        if not x_points or x_points[-1] < n:
            x_points.append(n)
            last_y = y_points[-1] if y_points else 0
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
        Find stable and unstable equilibria in absolute numbers.
        """
        spline, x, y, k = self._get_spline(smoothing)

        if spline is None:
            return {"stable": [], "unstable": []}

        # Find roots of spline(x) - x = 0
        diff_spline = UnivariateSpline(x, y - x, k=k, s=smoothing)
        roots = diff_spline.roots()

        valid_roots = [r for r in roots if 0 <= r <= self.n_total]
        equilibria = {"stable": [], "unstable": []}

        for r in valid_roots:
            slope = spline.derivatives(r)[1]
            # Group: people with threshold <= r
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
        eqs = self.find_equilibria(smoothing)
        for r, _ in eqs["stable"] + eqs["unstable"]:
            if r > self.min_count:
                return True
        return False

    def resolve(self, custom_seed=None, smoothing=None):
        """
        Resolve using the cryptographic Decrypter.
        """
        # The Decrypter has been maintained in sync via add/remove hooks.
        # Just call decrypt.
        return self.decrypter.decrypt()