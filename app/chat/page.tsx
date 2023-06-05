"use client"

import Chatbox from '@/components/Chatbox'
import React, { useState } from 'react'
import Image from "next/image"

export default function Chat() {
  const url = sessionStorage.getItem("blobURL")
  return (
    <div className='flex justify-around items-center'>
      {/* background and stable diffusion image goes here */}
    <Image
      src={url || "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"}
      alt="character"
      width={500}
      height={300}
      className="rounded-md object-cover"
    />
      <Chatbox url={url} />
    </div>
  )
}
