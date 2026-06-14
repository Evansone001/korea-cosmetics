'use client'

import { Star } from 'lucide-react';
import React, { useState } from 'react'
import { XIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { addRating } from '@/lib/features/rating/ratingSlice';
import { apiClient } from '@/lib/api-client';

interface RatingModalData {
  orderId: string
  productId: string
}

interface RatingModalProps {
  ratingModal: RatingModalData | null
  setRatingModal: (data: RatingModalData | null) => void
}

const RatingModal = ({ ratingModal, setRatingModal }: RatingModalProps) => {
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      toast.error('Please select a star rating');
      throw new Error('invalid rating');
    }

    if (!ratingModal) throw new Error('no modal data');

    const result = await apiClient.submitRating({
      product_id: ratingModal.productId,
      order_id: ratingModal.orderId,
      rating,
      review: review.trim() || undefined,
    }) as any;

    dispatch(addRating({
      id: result.rating.id,
      rating: result.rating.rating,
      review: result.rating.review,
      productId: ratingModal.productId,
      orderId: ratingModal.orderId,
      user: { name: '' },
      createdAt: result.rating.created_at,
      updatedAt: result.rating.updated_at,
      product: { name: '', category: '', id: ratingModal.productId },
    }));

    setRatingModal(null);
  }

  return (
    <div className='fixed inset-0 z-120 flex items-center justify-center bg-black/10'>
      <div className='bg-white p-8 rounded-lg shadow-lg w-96 relative'>
        <button onClick={() => setRatingModal(null)} className='absolute top-3 right-3 text-gray-500 hover:text-gray-700'>
          <XIcon size={20} />
        </button>
        <h2 className='text-xl font-medium text-slate-600 mb-4'>Rate Product</h2>
        <div className='flex items-center justify-center mb-4'>
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={`size-8 cursor-pointer ${rating > i ? "text-green-400 fill-current" : "text-gray-300"}`}
              onClick={() => setRating(i + 1)}
            />
          ))}
        </div>
        <textarea
          className='w-full p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-green-400'
          placeholder='Write your review (optional)'
          rows={4}
          value={review}
          onChange={(e) => setReview(e.target.value)}
        ></textarea>
        <button
          onClick={() => toast.promise(handleSubmit(), {
            loading: 'Submitting...',
            success: 'Review submitted!',
            error: (err) => err?.message !== 'invalid rating' && err?.message !== 'no modal data' ? 'Failed to submit review' : '',
          })}
          className='w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition'
        >
          Submit Rating
        </button>
      </div>
    </div>
  )
}

export default RatingModal
