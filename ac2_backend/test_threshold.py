import unittest
import secrets
from commit_classes import CommitEncrypter, NameHolder, CommitDecrypter
from threshold_encrypted import ThresholdEncryptedModel, ResolutionStrategy

class TestThresholdSystem(unittest.TestCase):
    def test_commit_encrypter_basics(self):
        names = ["Alice", "Bob", "Charlie"]
        nh = NameHolder(names)
        # Min count 1 (default)
        enc = CommitEncrypter(nh, len(names))
        
        # Test commit structure
        ct, x, vec = enc.commit("Alice", 2)
        self.assertIsInstance(ct, str)
        self.assertIsInstance(x, int)
        self.assertIsInstance(vec, list)
        self.assertEqual(len(vec), 3)
        
        ct_neg, x_neg, vec_neg = enc.commit("Bob", -1)
        self.assertEqual(len(vec_neg), 3)
        
        # Test non-member (should return noise)
        ct_inv, x_inv, vec_inv = enc.commit("Mallory", 2)
        self.assertEqual(len(vec_inv), 3)
        # Can't verify it's noise directly without knowing keys, but it shouldn't crash.

    def test_decryption_logic(self):
        names = ["A", "B", "C"]
        nh = NameHolder(names)
        enc = CommitEncrypter(nh, len(names), min_count=1)
        dec = CommitDecrypter(len(names))
        
        ct1, x1, vec1 = enc.commit("A", 1)
        dec.add_commitment(ct1, x1, vec1)
        res = dec.decrypt()
        self.assertIn("A", res)
        
        ct2, x2, vec2 = enc.commit("B", 2)
        dec.add_commitment(ct2, x2, vec2)
        res = dec.decrypt()
        self.assertIn("B", res)
        
    def test_discrete_model_integration(self):
        # Init with -1 (Never) so they don't accidentally trigger higher thresholds
        names = ["Alice", "Bob", "Charlie", "David"]
        prefs = [(n, -1) for n in names] 
        
        tm = ThresholdEncryptedModel(prefs, min_percentage=0.0)
        
        tm.add_preference("Alice", 2)
        tm.add_preference("Bob", 2)
        
        res = tm.resolve()
        self.assertIn("Alice", res)
        self.assertIn("Bob", res)
        self.assertNotIn("Charlie", res)
        
        tm.add_preference("Charlie", 3)
        res = tm.resolve()
        self.assertIn("Charlie", res)
        
        # David still -1
        self.assertNotIn("David", res)
        
        # Set David to 5 (clamped to 4)
        # If David is 4, he is willing if 4 people are.
        # A(2), B(2), C(3), D(4).
        # All 4 are willing at size 4.
        # So D is revealed.
        tm.add_preference("David", 5)
        res = tm.resolve()
        self.assertIn("David", res)

    def test_min_count_logic(self):
        names = ["A", "B", "C", "D"]
        # Init with -1
        prefs = [(n, -1) for n in names]
        # 0.75 * 4 = 3
        tm = ThresholdEncryptedModel(prefs, min_percentage=0.75) 
        
        self.assertEqual(tm.min_count, 3)
        
        tm.add_preference("A", 1)
        # A=1. k=3. 
        # Only A willing. Need 3.
        res = tm.resolve()
        self.assertEqual(len(res), 0)
        
        tm.add_preference("B", 1)
        res = tm.resolve()
        self.assertEqual(len(res), 0)
        
        tm.add_preference("C", 1)
        # A, B, C willing at 1.
        # All contribute to k=3 (since noise limit 2 <= 2).
        # 3 users. Need 3 points.
        res = tm.resolve()
        self.assertEqual(len(res), 3)
        self.assertIn("A", res)
        self.assertIn("B", res)
        self.assertIn("C", res)

if __name__ == "__main__":
    unittest.main()
