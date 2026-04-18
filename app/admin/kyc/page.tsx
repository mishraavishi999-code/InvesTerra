'use client'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

interface KycDoc {
  id: string
  documentType: string
  documentUrl: string
  status: string
  adminNotes: string | null
  createdAt: string
  user: { id: string; name: string | null; email: string }
}

export default function AdminKycPage() {
  const { user, token, loading: authLoading } = useAuth()
  const [documents, setDocuments] = useState<KycDoc[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('PENDING')
  const [actionMsg, setActionMsg] = useState('')

  useEffect(() => {
    if (authLoading) return
    if (!user || user.role !== 'ADMIN') {
      window.location.href = '/'
      return
    }
    fetchDocs()
  }, [user, authLoading, filter])

  const fetchDocs = async () => {
    setLoading(true)
    const res = await api.get<{ documents: KycDoc[] }>(`/api/kyc/admin?status=${filter}`, token)
    if (res.ok && res.data) {
      setDocuments(res.data.documents)
    }
    setLoading(false)
  }

  const handleAction = async (docId: string, status: string) => {
    setActionMsg('')
    const adminNotes = status === 'REJECTED'
      ? prompt('Reason for rejection:') || 'Documents unclear'
      : null

    const res = await api.put(
      '/api/kyc/admin',
      { documentId: docId, status, adminNotes },
      token
    )

    if (res.ok) {
      setActionMsg(`✅ Document ${status.toLowerCase()}!`)
      fetchDocs()
    } else {
      setActionMsg('❌ ' + (res.error || 'Action failed'))
    }
  }

  if (authLoading || !user) return null

  return (
    <main style={{
      minHeight: '100vh',
      backgroundColor: '#0f1e0f',
      padding: '6rem 2rem 4rem'
    }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '0.4rem 1.2rem',
          borderRadius: '25px',
          fontSize: '0.85rem',
          marginBottom: '1rem',
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>
          Admin Panel
        </div>

        <h1 style={{ color: '#f5f0e8', fontSize: '2rem', margin: '0 0 2rem 0' }}>
          KYC Verification Queue
        </h1>

        {/* Filter tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
          {['PENDING', 'APPROVED', 'REJECTED'].map(s => (
            <button key={s} onClick={() => setFilter(s)} style={{
              backgroundColor: filter === s ? 'rgba(200, 169, 110, 0.2)' : 'transparent',
              color: filter === s ? '#c8a96e' : '#a8c5a0',
              border: `1px solid ${filter === s ? 'rgba(200, 169, 110, 0.4)' : 'rgba(200, 169, 110, 0.15)'}`,
              padding: '0.5rem 1.2rem',
              borderRadius: '25px',
              cursor: 'pointer',
              fontSize: '0.85rem',
              fontFamily: 'Georgia, serif',
            }}>
              {s}
            </button>
          ))}
        </div>

        {actionMsg && (
          <div style={{
            backgroundColor: actionMsg.startsWith('❌') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(74, 222, 128, 0.1)',
            border: `1px solid ${actionMsg.startsWith('❌') ? 'rgba(239, 68, 68, 0.3)' : 'rgba(74, 222, 128, 0.3)'}`,
            borderRadius: '12px',
            padding: '1rem',
            textAlign: 'center',
            color: actionMsg.startsWith('❌') ? '#ef4444' : '#4ade80',
            marginBottom: '1rem',
            fontSize: '0.9rem'
          }}>
            {actionMsg}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', color: '#a8c5a0' }}>Loading...</div>
        ) : documents.length === 0 ? (
          <div style={{
            backgroundColor: '#132213',
            border: '1px solid rgba(200, 169, 110, 0.2)',
            borderRadius: '16px',
            padding: '3rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#a8c5a0' }}>No {filter.toLowerCase()} documents.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {documents.map(doc => (
              <div key={doc.id} style={{
                backgroundColor: '#132213',
                border: '1px solid rgba(200, 169, 110, 0.2)',
                borderRadius: '16px',
                padding: '1.5rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ color: '#f5f0e8', fontSize: '1rem', fontWeight: 'bold' }}>
                      {doc.user.name || doc.user.email}
                    </div>
                    <div style={{ color: '#a8c5a0', fontSize: '0.85rem' }}>{doc.user.email}</div>
                    <div style={{ color: '#c8a96e', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                      {doc.documentType} • {new Date(doc.createdAt).toLocaleDateString()}
                    </div>
                    <a href={doc.documentUrl} target="_blank" rel="noopener noreferrer" style={{
                      color: '#4ade80', fontSize: '0.85rem', textDecoration: 'none'
                    }}>
                      View Document →
                    </a>
                  </div>
                  {filter === 'PENDING' && (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                      <button onClick={() => handleAction(doc.id, 'APPROVED')} style={{
                        backgroundColor: 'rgba(74, 222, 128, 0.2)', color: '#4ade80',
                        border: '1px solid rgba(74, 222, 128, 0.4)', padding: '0.5rem 1.2rem',
                        borderRadius: '25px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Georgia, serif',
                      }}>
                        ✅ Approve
                      </button>
                      <button onClick={() => handleAction(doc.id, 'REJECTED')} style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444',
                        border: '1px solid rgba(239, 68, 68, 0.4)', padding: '0.5rem 1.2rem',
                        borderRadius: '25px', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'Georgia, serif',
                      }}>
                        ❌ Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
