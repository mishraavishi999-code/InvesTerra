'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

interface KycDocument {
  id: string
  documentType: string
  documentUrl: string
  status: string
  adminNotes: string | null
  createdAt: string
}

export default function KycPage() {
  const { user, token, loading: authLoading } = useAuth()
  const [documents, setDocuments] = useState<KycDocument[]>([])
  const [kycStatus, setKycStatus] = useState('')
  const [loading, setLoading] = useState(true)
  const [docType, setDocType] = useState('AADHAAR')
  const [docUrl, setDocUrl] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user) { window.location.href = '/auth'; return }
    fetchKyc()
  }, [user, authLoading])

  const fetchKyc = async () => {
    const res = await api.get<{ kycStatus: string; documents: KycDocument[] }>('/api/kyc', token)
    if (res.ok && res.data) {
      setKycStatus(res.data.kycStatus)
      setDocuments(res.data.documents)
    }
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!docUrl) {
      setMessage('❌ Please enter a document URL or file reference')
      return
    }
    setSubmitting(true)
    setMessage('')

    const res = await api.post(
      '/api/kyc',
      { documentType: docType, documentUrl: docUrl },
      token
    )

    if (res.ok) {
      setMessage('✅ Document submitted for verification!')
      setDocUrl('')
      fetchKyc()
    } else {
      setMessage('❌ ' + (res.error || 'Submission failed'))
    }
    setSubmitting(false)
  }

  if (authLoading || loading) return (
    <main style={{
      minHeight: '100vh', backgroundColor: '#0f1e0f',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#a8c5a0', fontSize: '1.2rem'
    }}>
      Loading...
    </main>
  )

  const statusColor = kycStatus === 'APPROVED' ? '#4ade80'
    : kycStatus === 'REJECTED' ? '#ef4444'
    : kycStatus === 'PENDING' ? '#facc15' : '#a8c5a0'

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0f1e0f',
      padding: '6rem 2rem 4rem'
    }}>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(200, 169, 110, 0.15)',
          border: '1px solid rgba(200, 169, 110, 0.3)',
          color: '#c8a96e',
          padding: '0.4rem 1.2rem',
          borderRadius: '25px',
          fontSize: '0.85rem',
          marginBottom: '1rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>
          Identity Verification
        </div>

        <h1 style={{ color: '#f5f0e8', fontSize: '2rem', margin: '0 0 0.5rem 0' }}>
          KYC Verification
        </h1>
        <p style={{ color: '#a8c5a0', marginBottom: '2rem' }}>
          Complete your identity verification to unlock full investment capabilities.
        </p>

        {/* Status card */}
        <div style={{
          backgroundColor: '#132213',
          border: `1px solid ${statusColor}33`,
          borderRadius: '16px',
          padding: '1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{
            width: '50px', height: '50px', borderRadius: '50%',
            backgroundColor: `${statusColor}22`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem'
          }}>
            {kycStatus === 'APPROVED' ? '✅' : kycStatus === 'REJECTED' ? '❌' : kycStatus === 'PENDING' ? '⏳' : '📄'}
          </div>
          <div>
            <div style={{ color: '#f5f0e8', fontSize: '1.1rem', fontWeight: 'bold' }}>
              Status: <span style={{ color: statusColor }}>{kycStatus}</span>
            </div>
            <div style={{ color: '#a8c5a0', fontSize: '0.85rem' }}>
              {kycStatus === 'APPROVED' ? 'Your identity is verified. You can invest freely.'
                : kycStatus === 'PENDING' ? 'Your documents are under review. This usually takes 24-48 hours.'
                : kycStatus === 'REJECTED' ? 'Please resubmit your documents with clear images.'
                : 'Submit your documents below to get verified.'}
            </div>
          </div>
        </div>

        {/* Submit form */}
        {kycStatus !== 'APPROVED' && (
          <div style={{
            backgroundColor: '#132213',
            border: '1px solid rgba(200, 169, 110, 0.2)',
            borderRadius: '16px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#f5f0e8', margin: '0 0 1.5rem 0' }}>Submit Document</h3>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ color: '#a8c5a0', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Document Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)} style={{
                width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
                border: '1px solid rgba(200, 169, 110, 0.2)', backgroundColor: '#0f1e0f',
                color: '#f5f0e8', fontSize: '1rem', fontFamily: 'Georgia, serif',
              }}>
                <option value="AADHAAR">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="PASSPORT">Passport</option>
                <option value="VOTER_ID">Voter ID</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ color: '#a8c5a0', fontSize: '0.85rem', display: 'block', marginBottom: '0.5rem' }}>Document URL / Reference</label>
              <input
                value={docUrl}
                onChange={e => setDocUrl(e.target.value)}
                placeholder="https://drive.google.com/... or file reference"
                style={{
                  width: '100%', padding: '0.8rem 1rem', borderRadius: '10px',
                  border: '1px solid rgba(200, 169, 110, 0.2)', backgroundColor: '#0f1e0f',
                  color: '#f5f0e8', fontSize: '1rem', boxSizing: 'border-box', fontFamily: 'Georgia, serif',
                }}
              />
              <div style={{ color: '#666', fontSize: '0.75rem', marginTop: '0.3rem' }}>
                Upload your document to Google Drive or similar and paste the link
              </div>
            </div>

            <button onClick={handleSubmit} disabled={submitting} style={{
              width: '100%', padding: '0.9rem',
              backgroundColor: '#c8a96e', color: '#1a2e1a', border: 'none',
              borderRadius: '10px', fontSize: '1rem', fontWeight: 'bold',
              cursor: submitting ? 'not-allowed' : 'pointer', fontFamily: 'Georgia, serif',
              opacity: submitting ? 0.7 : 1,
            }}>
              {submitting ? 'Submitting...' : 'Submit Document'}
            </button>
          </div>
        )}

        {/* Submitted documents */}
        {documents.length > 0 && (
          <div>
            <h3 style={{ color: '#f5f0e8', marginBottom: '1rem' }}>Submitted Documents</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {documents.map(doc => (
                <div key={doc.id} style={{
                  backgroundColor: '#132213',
                  border: '1px solid rgba(200, 169, 110, 0.15)',
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ color: '#f5f0e8', fontSize: '0.95rem' }}>{doc.documentType}</div>
                    <div style={{ color: '#666', fontSize: '0.75rem' }}>
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                    {doc.adminNotes && (
                      <div style={{ color: '#facc15', fontSize: '0.8rem', marginTop: '0.3rem' }}>
                        Note: {doc.adminNotes}
                      </div>
                    )}
                  </div>
                  <div style={{
                    backgroundColor: doc.status === 'APPROVED' ? 'rgba(74, 222, 128, 0.15)'
                      : doc.status === 'REJECTED' ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(250, 204, 21, 0.15)',
                    color: doc.status === 'APPROVED' ? '#4ade80' : doc.status === 'REJECTED' ? '#ef4444' : '#facc15',
                    padding: '0.3rem 0.8rem',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                  }}>
                    {doc.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {message && (
          <p style={{ color: message.startsWith('❌') ? '#ef4444' : '#4ade80', textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            {message}
          </p>
        )}
      </div>
    </main>
  )
}
