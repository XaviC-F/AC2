from threshold import ThresholdModel, ResolutionStrategy
import numpy as np
import random

# Test case from blog post
prefs = [
    ("Alex", 0.0),
    ("Betty", 0.0),
    ("Charlie", 0.1),
    ("Diana", 0.15),
    ("Evan", 0.2),
    ("Fred", 0.25),
    ("Grace", 0.3),
    ("Henry", 0.35),
    ("Isaac", 0.37),  # 7/19
    ("Jenny", 0.4),
    ("Kevin", 0.5),
    ("Lisa", 0.6),
    ("Mike", 0.7),
    ("Nancy", 0.8),
    ("Oscar", 0.9),
    ("Pete", 1.0),
    ("Quinn", 1.0),
    ("Riley", float("inf")),
    ("Steve", float("inf")),
    ("Tara", float("inf")),
]

print("=== Test 1: Default (Pessimistic, min=0.0) ===")
model = ThresholdModel(prefs)
print(f"Resolution Strategy: {model.resolution_strategy}")
active = model.resolve(smoothing=0)
print(f"Active Count: {len(active)}")
print(f"Active Percentage: {len(active)/len(prefs):.2f}")

print("\n=== Test 2: Optimistic ===")
model_opt = ThresholdModel(prefs, resolution_strategy=ResolutionStrategy.OPTIMISTIC)
active_opt = model_opt.resolve(smoothing=0)
print(f"Active Count: {len(active_opt)}")

print("\n=== Test 3: High Min Percentage (forcing function) ===")
model_forced = ThresholdModel(
    prefs, min_percentage=0.75, resolution_strategy=ResolutionStrategy.PESSIMISTIC
)
active_forced = model_forced.resolve(smoothing=0)
print(f"Active Count: {len(active_forced)}")
print(f"Active names: {active_forced}")

print("\n=== Test 4: Random Strategy ===")
model_rand = ThresholdModel(prefs, resolution_strategy=ResolutionStrategy.RANDOM)
active_rand = model_rand.resolve(smoothing=0)
print(f"Active Count: {len(active_rand)}")

print("\n=== Test 5: Custom Strategy ===")
model_custom = ThresholdModel(prefs, resolution_strategy=ResolutionStrategy.CUSTOM)
active_custom = model_custom.resolve(custom_seed=0.05, smoothing=0)
print(f"Active Count (seed 0.05): {len(active_custom)}")


print("\n=== Test 6: Complex Curve (Multiple Equilibria) ===")
# Construct alternating dense and sparse regions
complex_prefs = []
random.seed(42)
np.random.seed(42)

# 0.0-0.2: Dense (25 people) -> steep rise (Slope > 1)
# This creates a stable equilibrium where it crosses y=x (likely around 0.2-0.25)
for i in range(25):
    complex_prefs.append((f"G1_{i}", np.random.uniform(0.0, 0.2)))

# 0.2-0.4: Sparse (5 people) -> flat (Slope < 1)
# This allows y=x to catch up and cross back (creating unstable eq)
for i in range(5):
    complex_prefs.append((f"G2_{i}", np.random.uniform(0.2, 0.4)))

# 0.4-0.6: Dense (40 people) -> steep rise again (Slope > 1)
# Should cross y=x again (stable eq)
for i in range(40):
    complex_prefs.append((f"G3_{i}", np.random.uniform(0.4, 0.6)))

# 0.6-0.8: Sparse (5 people)
for i in range(5):
    complex_prefs.append((f"G4_{i}", np.random.uniform(0.6, 0.8)))

# 0.8-1.0: Dense (25 people)
for i in range(25):
    complex_prefs.append((f"G5_{i}", np.random.uniform(0.8, 1.0)))

# Total 100 people
model_complex = ThresholdModel(complex_prefs)
print("Finding equilibria for complex data (smoothing=0)...")
eqs = model_complex.find_equilibria(smoothing=0)

print("Stable Equilibria (%):", [f"{p:.2f}" for p, _ in eqs["stable"]])
print("Unstable Equilibria (%):", [f"{p:.2f}" for p, _ in eqs["unstable"]])

# Test resolution from different points
print("\nResolving from 0.0 (Pessimistic):")
res_pess = model_complex.resolve(smoothing=0)
print(f"Result: {len(res_pess)} active ({len(res_pess)/100:.2f})")

print("\nResolving from 1.0 (Optimistic):")
# Optimistic needs new model instance or just pass logic manually?
# resolve() uses self.resolution_strategy.
# We can create a new model.
model_comp_opt = ThresholdModel(
    complex_prefs, resolution_strategy=ResolutionStrategy.OPTIMISTIC
)
res_opt = model_comp_opt.resolve(smoothing=0)
print(f"Result: {len(res_opt)} active ({len(res_opt)/100:.2f})")

print("\nResolving from 0.5 (Custom):")
model_comp_custom = ThresholdModel(
    complex_prefs, resolution_strategy=ResolutionStrategy.CUSTOM
)
res_cust = model_comp_custom.resolve(custom_seed=0.5, smoothing=0)
print(f"Result: {len(res_cust)} active ({len(res_cust)/100:.2f})")
