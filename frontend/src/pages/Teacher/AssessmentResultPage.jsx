import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { submissionApi } from '../../services/api';
import { ArrowLeft, TrendingUp, AlertCircle } from 'lucide-react';
import TeacherLayout from '../../components/Teacher/TeacherLayout';

const AssessmentResultPage = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const response = await submissionApi.getAssessmentResult(assessmentId);
        setResult(response.data);
      } catch (err) {
        console.error('Error fetching assessment:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load assessment');
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [assessmentId]);

  if (loading) {
    return (
      <TeacherLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </TeacherLayout>
    );
  }

  if (error || !result) {
    return (
      <TeacherLayout>
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-400 hover:text-primary mb-6"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="card-premium p-8 text-center text-slate-600">
            {error || 'Assessment not found.'}
          </div>
        </div>
      </TeacherLayout>
    );
  }

  const percentage = result.max_score
    ? Math.round((result.total_score / result.max_score) * 100)
    : 0;
  const criteriaScores = result.criteria_scores && typeof result.criteria_scores === 'object'
    ? result.criteria_scores
    : {};
  const strengths = Array.isArray(result.overall_strengths) ? result.overall_strengths : [];
  const weaknesses = Array.isArray(result.overall_weaknesses) ? result.overall_weaknesses : [];

  return (
    <TeacherLayout>
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-primary mb-6 transition-all font-bold uppercase tracking-wider text-xs"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        <div className="bg-gradient-to-br from-primary to-accent text-white rounded-3xl p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div>
              <h1 className="text-4xl font-display font-bold mb-2">
                NAPLAN {result.genre} Assessment
              </h1>
              <p className="text-white/80">AI-Generated Analysis</p>
            </div>
            <div className="text-center">
              <div className="text-6xl font-display font-bold">
                {result.total_score}
                <span className="text-3xl text-white/80">/{result.max_score}</span>
              </div>
              <div className="text-xl font-bold mt-2">{percentage}%</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-success" size={24} />
              <h2 className="font-display font-bold text-xl">Strengths</h2>
            </div>
            <ul className="space-y-2">
              {strengths.length ? strengths.map((strength, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-success">✓</span>
                  <span className="text-slate-700">{strength}</span>
                </li>
              )) : (
                <li className="text-slate-500">No strengths recorded.</li>
              )}
            </ul>
          </div>

          <div className="card-premium p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="text-secondary" size={24} />
              <h2 className="font-display font-bold text-xl">Areas for Growth</h2>
            </div>
            <ul className="space-y-2">
              {weaknesses.length ? weaknesses.map((weakness, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-secondary">→</span>
                  <span className="text-slate-700">{weakness}</span>
                </li>
              )) : (
                <li className="text-slate-500">No areas recorded.</li>
              )}
            </ul>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <h2 className="text-3xl font-display font-bold">Detailed Assessment</h2>
          {Object.entries(criteriaScores).map(([criterion, data]) => (
            <CriterionCard
              key={criterion}
              name={criterion}
              data={data}
            />
          ))}
        </div>

        {result.full_report_md && (
          <div className="card-premium p-6">
            <h2 className="text-2xl font-display font-bold mb-4">Full Report</h2>
            <div className="prose prose-slate max-w-none">
              <pre className="whitespace-pre-wrap text-sm text-slate-700 font-sans">{result.full_report_md}</pre>
            </div>
          </div>
        )}
      </div>
    </TeacherLayout>
  );
};

const CriterionCard = ({ name, data }) => {
  if (!data || typeof data !== 'object') return null;
  const score = Number(data.score) || 0;
  const maxScore = Number(data.max_score) || 1;
  const percentage = maxScore ? (score / maxScore) * 100 : 0;
  const feedback = data.feedback || '';
  const evidence = Array.isArray(data.evidence) ? data.evidence : [];
  const recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];

  return (
    <div className="card-premium p-6">
      <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h3 className="text-xl font-display font-bold capitalize">
          {name.replace(/_/g, ' ')}
        </h3>
        <div className="flex items-center gap-3">
          <div className="w-32 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-success to-primary transition-all"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <span className="text-2xl font-bold text-slate-900">
            {score}<span className="text-slate-400">/{maxScore}</span>
          </span>
        </div>
      </div>

      {feedback && <p className="text-slate-700 mb-4">{feedback}</p>}

      {evidence.length > 0 && (
        <div className="mb-4">
          <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-2">
            Evidence
          </h4>
          <ul className="space-y-2">
            {evidence.map((quote, i) => (
              <li key={i} className="pl-4 border-l-2 border-primary/20 text-sm text-slate-600 italic">
                &quot;{quote}&quot;
              </li>
            ))}
          </ul>
        </div>
      )}

      {recommendations.length > 0 && (
        <div>
          <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-2">
            Recommendations
          </h4>
          <ul className="space-y-1">
            {recommendations.map((rec, i) => (
              <li key={i} className="text-sm text-slate-700 flex gap-2">
                <span className="text-secondary">→</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AssessmentResultPage;
