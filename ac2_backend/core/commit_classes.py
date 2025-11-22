import hashlib
import secrets
import random
from typing import List, Tuple, Dict, Set, Optional
from itertools import combinations

class NameHolder:
    def __init__(self, names: List[str]):
        """
        Initialize with a list of names.
        Stores hashes only and deletes the original list.
        """
        self.hashes = {self._hash_name(name) for name in names}
        # Original list is not stored

    def _hash_name(self, name: str) -> str: 
        # Use a strong hash
        return hashlib.sha256(name.encode('utf-8')).hexdigest()

    def is_member(self, name: str) -> bool:
        return self._hash_name(name) in self.hashes

class CommitEncrypter:
    def __init__(self, name_holder: NameHolder, group_size: int, min_count: int = 1, seed: str = None):
        """
        Initialize the encryption server state.
        name_holder: The NameHolder instance to verify membership.
        group_size: The size of the authorized set N (upper bound).
        min_count: The minimum number of people required to reveal anything.
                   Rows 0 to min_count-2 will always be noise.
        seed: Optional seed to deterministically initialize coefficients.
        """
        self.name_holder = name_holder
        self.n = group_size
        self.min_count = max(1, min_count)
        
        # Mersenne Prime 2**127 - 1
        self.MOD = 2**127 - 1
        
        if seed:
            # Deterministic initialization
            self.rng = random.Random(seed)
        else:
            # Randomized initialization
            self.rng = random.Random(secrets.token_bytes(32))

        # Generate coefficients a_0 ... a_{n-1}
        self.coeffs = [self.rng.randint(0, self.MOD - 1) for _ in range(self.n)]

        # Track used x values to ensure uniqueness
        self.used_xs: Set[int] = set()
        
    def _encrypt_name(self, key_int: int, name: str) -> str:
        """
        Encrypt name using a key derived from a polynomial coefficient.
        Prepends a magic string 'AC2:' to verify decryption.
        """
        key_bytes = hashlib.sha256(str(key_int).encode()).digest()
        # Prepend magic bytes for verification
        plaintext = "AC2:" + name
        pt_bytes = plaintext.encode('utf-8')
        ct_bytes = bytearray()
        for i, b in enumerate(pt_bytes):
            ct_bytes.append(b ^ key_bytes[i % len(key_bytes)])
        return ct_bytes.hex()

    def _eval_poly(self, row_idx: int, x: int) -> int:
        """
        Evaluate f_row_idx(x) = sum(a_j * x^j) for j=0..row_idx
        """
        y = 0
        x_pow = 1
        for j in range(row_idx + 1):
            if j >= len(self.coeffs): 
                break
            term = (self.coeffs[j] * x_pow) % self.MOD
            y = (y + term) % self.MOD
            x_pow = (x_pow * x) % self.MOD
        return y

    def _get_unique_x(self) -> int:
        """Generate a random x that hasn't been used before."""
        while True:
            x = self.rng.randint(1, self.MOD - 1) # x cannot be 0
            if x not in self.used_xs:
                self.used_xs.add(x)
                return x
                
    def set_used_xs(self, used_xs: List[int]):
        """Manually set used xs (e.g. when restoring state)"""
        self.used_xs = set(used_xs)

    def commit(self, name: str, threshold: int) -> Tuple[str, List[Tuple[int, int]]]:
        """
        Returns (ciphertext, points).
        points is a list of (x, y) tuples for each level i=0..n-1.
        threshold: raw number of people required (1 to n). -1 for never.
        """
        # Check membership first
        if not self.name_holder.is_member(name):
            # Not in group: Return noise
            points = []
            for _ in range(self.n):
                x = self._get_unique_x()
                y = self.rng.randint(0, self.MOD - 1)
                points.append((x, y))
            return secrets.token_hex(16), points

        if threshold == -1:
            # All noise
            points = []
            for _ in range(self.n):
                x = self._get_unique_x()
                y = self.rng.randint(0, self.MOD - 1)
                points.append((x, y))
            return secrets.token_hex(16), points
            
        # Clamp threshold to [1, n]
        p_m = max(1, min(threshold, self.n))
        
        # Encrypt name with key a_{p_m-1}
        key = self.coeffs[p_m - 1]
        ciphertext = self._encrypt_name(key, name)
        
        points = []
        
        # Determine noise floor
        global_noise_limit = self.min_count - 1
        user_noise_limit = p_m - 1
        noise_limit = max(global_noise_limit, user_noise_limit)
        
        for i in range(self.n):
            x = self._get_unique_x()
            if i < noise_limit:
                y = self.rng.randint(0, self.MOD - 1)
            else:
                y = self._eval_poly(i, x)
            points.append((x, y))
                
        return ciphertext, points

class CommitDecrypter:
    def __init__(self, n: int):
        self.n = n
        self.MOD = 2**127 - 1
        # Store commitments as (ciphertext, points, original_index)
        # points is List[(x, y)]
        self.commitments: List[Tuple[str, List[Tuple[int, int]], int]] = []

    def add_commitment(self, ciphertext: str, points: List[Tuple[int, int]]):
        self.commitments.append((ciphertext, points, len(self.commitments)))

    def _decrypt_name(self, key_int: int, ciphertext_hex: str) -> Optional[str]:
        try:
            ct_bytes = bytes.fromhex(ciphertext_hex)
            key_bytes = hashlib.sha256(str(key_int).encode()).digest()
            pt_bytes = bytearray()
            for i, b in enumerate(ct_bytes):
                pt_bytes.append(b ^ key_bytes[i % len(key_bytes)])
            
            plaintext = pt_bytes.decode('utf-8')
            if plaintext.startswith("AC2:"):
                return plaintext[4:]
            return None
        except Exception:
            return None

    def _recover_coeffs(self, points: List[Tuple[int, int]]) -> List[int]:
        """
        Recover all coefficients [a_0, a_1, ..., a_{k-1}] for polynomial of degree k-1.
        f(x) = sum(a_i * x^i)
        """
        k = len(points)
        if k == 0: return []
        
        xs = [p[0] for p in points]
        ys = [p[1] for p in points]
        
        final_coeffs = [0] * k
        
        for j in range(k):
            xj = xs[j]
            yj = ys[j]
            
            # Calculate denominator: prod(xj - xi)
            denom = 1
            for i in range(k):
                if i == j: continue
                denom = (denom * (xj - xs[i])) % self.MOD
            
            inv_denom = pow(denom, -1, self.MOD)
            term_scaler = (yj * inv_denom) % self.MOD
            
            # Calculate numerator poly: prod(x - xi)
            current_poly = [1] 
            
            for i in range(k):
                if i == j: continue
                # Multiply current_poly by (x - xi)
                xi = xs[i]
                new_poly = [0] * (len(current_poly) + 1)
                for deg in range(len(current_poly)):
                    # Term x * coeff * x^deg = coeff * x^{deg+1}
                    new_poly[deg+1] = (new_poly[deg+1] + current_poly[deg]) % self.MOD
                    # Term -xi * coeff * x^deg
                    new_poly[deg] = (new_poly[deg] - xi * current_poly[deg]) % self.MOD
                current_poly = new_poly
                
            # Add to final
            for deg in range(len(current_poly)):
                term = (current_poly[deg] * term_scaler) % self.MOD
                final_coeffs[deg] = (final_coeffs[deg] + term) % self.MOD
                
        return final_coeffs

    def decrypt(self) -> List[str]:
        revealed_users: Dict[int, str] = {}
        confirmed_thresholds: Dict[int, int] = {} 
        
        for k in range(1, self.n + 1):
            confirmed_users = [idx for idx, t in confirmed_thresholds.items() if t <= k]
            unknown_users = [idx for idx in range(len(self.commitments)) if idx not in confirmed_thresholds]
            
            if len(confirmed_users) >= k:
                subset_indices = confirmed_users[:k]
                points = []
                for idx in subset_indices:
                    ct, pts, _ = self.commitments[idx]
                    # pts is list of (x, y). We need the one for level k-1
                    points.append(pts[k-1])
                
                coeffs = self._recover_coeffs(points)
                
                # Try to decrypt unknown users
                for u_idx in unknown_users:
                    ct, _, _ = self.commitments[u_idx]
                    found_name = None
                    found_t = None
                    for t_candidate in range(1, k + 1):
                        key_idx = t_candidate - 1
                        if key_idx < len(coeffs):
                            name = self._decrypt_name(coeffs[key_idx], ct)
                            if name:
                                found_name = name
                                found_t = t_candidate
                                break
                    
                    if found_name:
                        revealed_users[u_idx] = found_name
                        confirmed_thresholds[u_idx] = found_t 
                
                continue 
            
            needed = k - len(confirmed_users)
            if needed > len(unknown_users):
                continue
            
            MAX_COMBS = 1000000
            comb_count = 0
            
            base_points = []
            for idx in confirmed_users:
                ct, pts, _ = self.commitments[idx]
                base_points.append(pts[k-1])
            
            for unknown_subset in combinations(unknown_users, needed):
                comb_count += 1
                if comb_count > MAX_COMBS:
                    break
                
                current_points = list(base_points)
                for u_idx in unknown_subset:
                    ct, pts, _ = self.commitments[u_idx]
                    current_points.append(pts[k-1])
                
                coeffs = self._recover_coeffs(current_points)
                
                all_match = True
                newly_revealed = []
                
                for u_idx in unknown_subset:
                    ct, _, _ = self.commitments[u_idx]
                    
                    found_name = None
                    found_t = None
                    for t_candidate in range(1, k + 1):
                        key_idx = t_candidate - 1
                        if key_idx < len(coeffs):
                            name = self._decrypt_name(coeffs[key_idx], ct)
                            if name:
                                found_name = name
                                found_t = t_candidate
                                break
                    
                    if found_name:
                        newly_revealed.append((u_idx, found_name, found_t))
                    else:
                        all_match = False
                        break
                
                if all_match:
                    # Found valid set
                    for u_idx, name, t in newly_revealed:
                        revealed_users[u_idx] = name
                        confirmed_thresholds[u_idx] = t
                    
                    # Check remaining
                    remaining = [u for u in unknown_users if u not in unknown_subset]
                    for u_idx in remaining:
                        ct, _, _ = self.commitments[u_idx]
                        for t_candidate in range(1, k + 1):
                            key_idx = t_candidate - 1
                            if key_idx < len(coeffs):
                                name = self._decrypt_name(coeffs[key_idx], ct)
                                if name:
                                    revealed_users[u_idx] = name
                                    confirmed_thresholds[u_idx] = t_candidate
                                    break
                    break
        
        return sorted(list(revealed_users.values()))
