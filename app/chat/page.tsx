"use client"

import Chatbox from '@/components/Chatbox'
import React, { useState } from 'react'
import Image from "next/image"

export default function Chat() {
  let url: string = "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
  if(typeof window !== 'undefined'){
    let blobURL = localStorage.getItem("blobURL");
    if(blobURL !== null) {
      url = blobURL;
    }
  }
  return (
    <div className='flex items-center justify-around'>
      {/* background and stable diffusion image goes here */}
    <Image
      src={url}
      alt="character"
      width={500}
      height={300}
      className="rounded-md object-cover"
    />
      <Chatbox url={url} />
    </div>
  )
}
