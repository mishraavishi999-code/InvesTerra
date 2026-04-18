import { ethers, BrowserProvider, JsonRpcSigner } from 'ethers'

// ─── Contract ABIs (minimal interfaces) ──────────────────────────────────────

export const LAND_SHARES_ABI = [
  'function balanceOf(address account, uint256 id) view returns (uint256)',
  'function balanceOfBatch(address[] accounts, uint256[] ids) view returns (uint256[])',
  'function uri(uint256 id) view returns (string)',
  'function safeTransferFrom(address from, address to, uint256 id, uint256 amount, bytes data)',
  'function setApprovalForAll(address operator, bool approved)',
  'function isApprovedForAll(address account, address operator) view returns (bool)',
  'event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)',
]

export const MARKETPLACE_ABI = [
  'function listShares(uint256 tokenId, uint256 amount, uint256 pricePerShare)',
  'function buyShares(uint256 listingId) payable',
  'function cancelListing(uint256 listingId)',
  'function getActiveListing(uint256 listingId) view returns (tuple(address seller, uint256 tokenId, uint256 amount, uint256 pricePerShare, bool active))',
  'function listingCount() view returns (uint256)',
  'event SharesListed(uint256 indexed listingId, address indexed seller, uint256 tokenId, uint256 amount, uint256 pricePerShare)',
  'event SharesSold(uint256 indexed listingId, address indexed buyer, uint256 tokenId, uint256 amount, uint256 totalPrice)',
  'event ListingCancelled(uint256 indexed listingId)',
]

// ─── Provider / Signer Helpers ───────────────────────────────────────────────

export function getProvider(): BrowserProvider | null {
  if (typeof window === 'undefined') return null
  const ethereum = (window as unknown as { ethereum?: ethers.Eip1193Provider }).ethereum
  if (!ethereum) return null
  return new BrowserProvider(ethereum)
}

export async function getSigner(): Promise<JsonRpcSigner | null> {
  const provider = getProvider()
  if (!provider) return null
  return provider.getSigner()
}

export async function connectWallet(): Promise<string | null> {
  const provider = getProvider()
  if (!provider) {
    alert('Please install MetaMask to connect your wallet.')
    return null
  }

  try {
    const accounts = await provider.send('eth_requestAccounts', [])
    return accounts[0] || null
  } catch {
    return null
  }
}

export async function getWalletAddress(): Promise<string | null> {
  const provider = getProvider()
  if (!provider) return null
  try {
    const accounts = await provider.send('eth_accounts', [])
    return accounts[0] || null
  } catch {
    return null
  }
}

export async function signMessage(message: string): Promise<string | null> {
  const signer = await getSigner()
  if (!signer) return null
  try {
    return signer.signMessage(message)
  } catch {
    return null
  }
}

// ─── Contract Instances ──────────────────────────────────────────────────────

export function getLandSharesContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const address = process.env.NEXT_PUBLIC_LAND_SHARES_CONTRACT
  if (!address || address.startsWith('0x_')) return null
  return new ethers.Contract(address, LAND_SHARES_ABI, signerOrProvider)
}

export function getMarketplaceContract(signerOrProvider?: ethers.Signer | ethers.Provider) {
  const address = process.env.NEXT_PUBLIC_MARKETPLACE_CONTRACT
  if (!address || address.startsWith('0x_')) return null
  return new ethers.Contract(address, MARKETPLACE_ABI, signerOrProvider)
}

// ─── Chain Helpers ───────────────────────────────────────────────────────────

const AMOY_CHAIN_ID = '0x13882' // 80002

export async function switchToAmoy(): Promise<boolean> {
  const ethereum = (window as unknown as { ethereum?: ethers.Eip1193Provider & { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } }).ethereum
  if (!ethereum) return false

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: AMOY_CHAIN_ID }],
    })
    return true
  } catch (switchError: unknown) {
    // Chain not added, add it
    if ((switchError as { code?: number }).code === 4902) {
      try {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: AMOY_CHAIN_ID,
              chainName: 'Polygon Amoy Testnet',
              nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
              rpcUrls: ['https://rpc-amoy.polygon.technology'],
              blockExplorerUrls: ['https://amoy.polygonscan.com/'],
            },
          ],
        })
        return true
      } catch {
        return false
      }
    }
    return false
  }
}

// ─── On-chain Balance Check ──────────────────────────────────────────────────

export async function getOnChainBalance(
  walletAddress: string,
  tokenId: number
): Promise<string> {
  const rpc = process.env.NEXT_PUBLIC_POLYGON_RPC
  if (!rpc) return '0'
  const provider = new ethers.JsonRpcProvider(rpc)
  const contract = getLandSharesContract(provider)
  if (!contract) return '0'
  try {
    const balance = await contract.balanceOf(walletAddress, tokenId)
    return balance.toString()
  } catch {
    return '0'
  }
}
