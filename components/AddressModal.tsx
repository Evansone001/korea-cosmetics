'use client'
import { XIcon } from "lucide-react"
import { useState, FormEvent, useEffect } from "react"
import { toast } from "react-hot-toast"
import { apiClient } from "@/lib/api-client"

interface UserData {
  id?: string
  name?: string
  email?: string
  phone?: string
  first_name?: string
  last_name?: string
}

interface StoreData {
  address_line1?: string
  address_line2?: string
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
  contact?: string
}

interface AddressModalProps {
  setShowAddressModal: (show: boolean) => void
  onAddressCreated?: (address: any) => void
  userData?: UserData
  storeData?: StoreData
}

interface AddressFormData {
  name: string
  email: string
  street: string
  address_line2: string
  city: string
  state: string
  zip: string
  country: string
  phone: string
  address_type: string
}

const AddressModal = ({ setShowAddressModal, onAddressCreated, userData, storeData }: AddressModalProps) => {
  const [address, setAddress] = useState<AddressFormData>({
    name: '',
    email: '',
    street: '',
    address_line2: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    phone: '',
    address_type: 'home'
  })

  // Prefill form when props change
  useEffect(() => {
    const getName = () => {
      if (userData?.name) return userData.name
      if (userData?.first_name || userData?.last_name) {
        return `${userData?.first_name || ''} ${userData?.last_name || ''}`.trim()
      }
      return ''
    }

    setAddress(prev => ({
      ...prev,
      name: getName(),
      email: userData?.email || '',
      street: storeData?.address_line1 || storeData?.address || '',
      address_line2: storeData?.address_line2 || '',
      city: storeData?.city || '',
      state: storeData?.state || '',
      zip: storeData?.postal_code || '',
      country: storeData?.country || '',
      phone: userData?.phone || storeData?.contact || '',
    }))
  }, [userData, storeData])

  const [loading, setLoading] = useState(false)

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await apiClient.createAddress(address)
      toast.success('Address saved successfully')
      setShowAddressModal(false)
      if (onAddressCreated) {
        onAddressCreated(response.address)
      }
    } catch (error) {
      toast.error('Failed to save address')
      console.error('Error creating address:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="fixed inset-0 z-50 bg-white/60 backdrop-blur h-screen flex items-center justify-center">
      <div className="flex flex-col gap-5 text-slate-700 w-full max-w-sm mx-6 bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-3xl">Add New <span className="font-semibold">Address</span></h2>
        <input 
          name="name" 
          onChange={handleAddressChange} 
          value={address.name} 
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
          type="text" 
          placeholder="Enter your name" 
          required 
        />
        <input 
          name="email" 
          onChange={handleAddressChange} 
          value={address.email} 
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
          type="email" 
          placeholder="Email address" 
          required 
        />
        <input 
          name="street" 
          onChange={handleAddressChange} 
          value={address.street} 
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
          type="text" 
          placeholder="Street" 
          required 
        />
        <input 
          name="address_line2" 
          onChange={handleAddressChange} 
          value={address.address_line2} 
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
          type="text" 
          placeholder="Apartment, suite, etc. (optional)" 
        />
        <div className="flex gap-4">
          <input 
            name="city" 
            onChange={handleAddressChange} 
            value={address.city} 
            className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
            type="text" 
            placeholder="City" 
            required 
          />
          <input 
            name="state" 
            onChange={handleAddressChange} 
            value={address.state} 
            className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
            type="text" 
            placeholder="State" 
            required 
          />
        </div>
        <div className="flex gap-4">
          <input 
            name="zip" 
            onChange={handleAddressChange} 
            value={address.zip} 
            className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
            type="text" 
            placeholder="Zip code" 
            required 
          />
          <input 
            name="country" 
            onChange={handleAddressChange} 
            value={address.country} 
            className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
            type="text" 
            placeholder="Country" 
            required 
          />
        </div>
        <input 
          name="phone" 
          onChange={handleAddressChange} 
          value={address.phone} 
          className="p-2 px-4 outline-none border border-slate-200 rounded w-full" 
          type="text" 
          placeholder="Phone (optional)" 
        />
        <select name="address_type" onChange={handleAddressChange} value={address.address_type} className="p-2 px-4 outline-none border border-slate-200 rounded w-full">
          <option value="home">Home</option>
          <option value="work">Work</option>
          <option value="other">Other</option>
        </select>
        <button type="submit" disabled={loading} className="bg-slate-800 text-white text-sm font-medium py-2.5 rounded-md hover:bg-slate-900 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Saving...' : 'SAVE ADDRESS'}
        </button>
      </div>
      <XIcon size={30} className="absolute top-5 right-5 text-slate-500 hover:text-slate-700 cursor-pointer" onClick={() => setShowAddressModal(false)} />
    </form>
  )
}

export default AddressModal
