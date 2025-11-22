'use client'

import { useState } from 'react';
import { Lock, Target, CheckCircle, XCircle, Upload, X } from 'lucide-react';

export default function CommitmentPage() {
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [commitNumber, setCommitNumber] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Mock objective data - in real app, this would come from props/API
  const objective = {
    id: "obj_123",
    title: "Unionize Our Workplace",
    description: "Let's organize a union to collectively bargain for better working conditions, fair wages, and job security. This is a confidential commitment - your response will remain anonymous.",
    threshold: 20,
    thresholdType: "percentage",
    totalEligible: 150,
    currentCommitments: 18,
    deadline: "2025-12-31",
    createdBy: "Anonymous Organizer",
    category: "Labor Rights"
  };

  const handleCommitment = async (choice) => {
    setSelectedChoice(choice);
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const removeFile = (index) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const isCommitNumberValid = /^\d+$/.test(commitNumber.trim()) && Number(commitNumber) >= 1 && Number(commitNumber) <= 100;

  const handleSubmit = async () => {
    if (!selectedChoice || !name.trim() || !commitNumber.trim() || !isCommitNumberValid) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Commitment Recorded</h1>
            <p className="text-slate-600 text-lg">
              Your anonymous {selectedChoice === 'commit' ? 'commitment' : 'response'} has been securely recorded
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-6 mb-6">
            <div className="flex items-center justify-center gap-2 text-slate-700 mb-2">
              <Lock className="w-5 h-5" />
              <span className="font-semibold">Your Identity is Protected</span>
            </div>
            <p className="text-sm text-slate-600">
              Your commitment is cryptographically secured and cannot be traced back to you.
              Only the aggregate results will be visible.
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => (window.location.href = '/objectives')}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              View All Objectives
            </button>
            <button
              onClick={() => {
                setIsSubmitted(false);
                setSelectedChoice(null);
                setName('');
                setCommitNumber('');
                setUploadedFiles([]);
              }}
              className="w-full bg-slate-200 text-slate-700 py-3 px-6 rounded-lg font-semibold hover:bg-slate-300 transition-colors"
            >
              Make Another Commitment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Lock className="w-4 h-4" />
            Anonymous & Secure
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Make Your Commitment</h1>
          <p className="text-slate-600">Your response will remain completely anonymous</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Objective Details */}
          <div className="p-8 border-b border-slate-200">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-500 uppercase font-semibold mb-1">{objective.category}</div>
                <h2 className="text-2xl font-bold text-slate-900 mb-3">{objective.title}</h2>
                <p className="text-slate-700 leading-relaxed">{objective.description}</p>
              </div>
            </div>

            {/* Threshold Info */}
            <div className="bg-slate-50 rounded-xl p-6 mt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-slate-600 mb-1">Threshold Required</div>
                  <div className="text-2xl font-bold text-slate-900">{objective.threshold}%</div>
                </div>
                <div>
                  <div className="text-sm text-slate-600 mb-1">Deadline</div>
                  <div className="text-lg font-bold text-slate-900">{new Date(objective.deadline).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Commitment Options */}
          <div className="p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-6">Your Commitment</h3>

            {/* Name Field */}
            <div className="mb-6">
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-2">
                Your Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                required
              />
            </div>

            {/* Threshold Percentage Field */}
            <div className="mb-6">
              <label htmlFor="commitNumber" className="block text-sm font-semibold text-slate-700 mb-2">
                Required Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                id="commitNumber"
                value={commitNumber}
                onChange={(e) => {
                  const v = e.target.value;
                  if (/^[0-9]*$/.test(v)) setCommitNumber(v);
                }}
                placeholder="Enter a percentage (1-100)"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  commitNumber.length === 0 || isCommitNumberValid
                    ? 'border-slate-200 focus:border-blue-500'
                    : 'border-red-400 focus:border-red-500'
                }`}
                required
              />
              {commitNumber.length > 0 && !isCommitNumberValid && (
                <p className="text-sm text-red-600 mt-2">Please enter a number between 1 and 100.</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <button
                onClick={() => handleCommitment('commit')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedChoice === 'commit'
                    ? 'border-green-500 bg-green-50'
                    : 'border-slate-200 hover:border-green-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${selectedChoice === 'commit' ? 'bg-green-500' : 'bg-slate-100'}`}>
                    <CheckCircle className={`w-6 h-6 ${selectedChoice === 'commit' ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg text-slate-900 mb-1">Yes, I Commit</div>
                    <div className="text-sm text-slate-600">I will participate if the threshold is met</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleCommitment('decline')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  selectedChoice === 'decline'
                    ? 'border-red-500 bg-red-50'
                    : 'border-slate-200 hover:border-red-300 bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${selectedChoice === 'decline' ? 'bg-red-500' : 'bg-slate-100'}`}>
                    <XCircle className={`w-6 h-6 ${selectedChoice === 'decline' ? 'text-white' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-lg text-slate-900 mb-1">No, I Decline</div>
                    <div className="text-sm text-slate-600">I will not participate in this objective</div>
                  </div>
                </div>
              </button>
            </div>

            {/* File Upload */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Supporting Documents <span className="text-slate-500">(Optional)</span>
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                <input type="file" id="file-upload" multiple onChange={handleFileUpload} className="hidden" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <div className="text-sm text-slate-600 mb-1">
                    <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop
                  </div>
                  <div className="text-xs text-slate-500">PDF, DOC, Images up to 10MB</div>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 px-4 py-3 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <Upload className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900">{file.name}</div>
                          <div className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      <button onClick={() => removeFile(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <Lock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900">
                  <strong>Privacy Guarantee:</strong> Your commitment is encrypted and anonymized.
                  No one, including the organizer, can see individual responses. Only aggregate statistics are visible.
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!selectedChoice || !name.trim() || !commitNumber.trim() || !isCommitNumberValid || isSubmitting}
              className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
                selectedChoice && name.trim() && commitNumber.trim() && isCommitNumberValid && !isSubmitting
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? 'Submitting Securely...' : 'Submit My Commitment'}
            </button>

            <p className="text-center text-sm text-slate-500 mt-4">You can change your commitment anytime before the deadline</p>
          </div>
        </div>
      </div>
    </div>
  );
}
