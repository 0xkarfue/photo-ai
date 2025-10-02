// lib/imageGeneration.ts - Hugging Face Implementation

/**
 * Real Image Generation using Hugging Face Inference API
 * Model: Stable Diffusion XL
 * FREE - No credit card required
 */

interface GenerationResult {
  success: boolean
  imageData?: string
  error?: string
}

export async function generateImage(
  prompt: string,
  negativePrompt: string = "blurry, bad quality, distorted, ugly, deformed"
): Promise<GenerationResult> {
  const apiToken = process.env.HUGGINGFACE_TOKEN

  if (!apiToken) {
    throw new Error('HUGGINGFACE_TOKEN not found in environment variables')
  }

  try {
    console.log('Starting image generation with Hugging Face...')
    console.log('Prompt:', prompt)

    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            negative_prompt: negativePrompt,
            num_inference_steps: 30,
            guidance_scale: 7.5,
          }
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      
      // Check if model is loading
      if (response.status === 503) {
        console.log('Model is loading, retrying in 20 seconds...')
        await new Promise(resolve => setTimeout(resolve, 20000))
        
        // Retry once
        const retryResponse = await fetch(
          'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: prompt,
              parameters: {
                negative_prompt: negativePrompt,
                num_inference_steps: 30,
                guidance_scale: 7.5,
              }
            }),
          }
        )

        if (!retryResponse.ok) {
          throw new Error(`Hugging Face API error: ${retryResponse.status}`)
        }

        const imageBlob = await retryResponse.blob()
        const arrayBuffer = await imageBlob.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)
        const base64Image = `data:image/png;base64,${buffer.toString('base64')}`

        console.log('Image generated successfully (after retry)!')
        return {
          success: true,
          imageData: base64Image
        }
      }

      throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`)
    }

    // Convert response to base64
    const imageBlob = await response.blob()
    const arrayBuffer = await imageBlob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = `data:image/png;base64,${buffer.toString('base64')}`

    console.log('Image generated successfully!')
    
    return {
      success: true,
      imageData: base64Image
    }

  } catch (error: any) {
    console.error('Image generation error:', error)
    return {
      success: false,
      error: error.message
    }
  }
}

// Remove the imageUrlToBase64 function - not needed for Hugging Face
// Hugging Face returns image directly, no URL needed

// /**
//  * Real Image Generation using Replicate API
//  * Model: Stable Diffusion XL
//  */

// interface GenerationResult {
//   success: boolean
//   imageUrl?: string
//   error?: string
// }

// export async function generateImage(
//   prompt: string,
//   negativePrompt: string = "blurry, bad quality, distorted, ugly"
// ): Promise<GenerationResult> {
//   const apiToken = process.env.REPLICATE_API_TOKEN

//   if (!apiToken) {
//     throw new Error('REPLICATE_API_TOKEN not found in environment variables')
//   }

//   try {
//     console.log('Starting image generation with Replicate...')
//     console.log('Prompt:', prompt)

//     // Create prediction
//     const response = await fetch('https://api.replicate.com/v1/predictions', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Token ${apiToken}`,
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         version: 'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
//         input: {
//           prompt: prompt,
//           negative_prompt: negativePrompt,
//           width: 1024,
//           height: 1024,
//           num_outputs: 1,
//           scheduler: "K_EULER",
//           num_inference_steps: 25,
//           guidance_scale: 7.5,
//         },
//       }),
//     })

//     if (!response.ok) {
//       const error = await response.text()
//       throw new Error(`Replicate API error: ${response.status} - ${error}`)
//     }

//     const prediction = await response.json()
//     console.log('Prediction created:', prediction.id)

//     // Poll for completion
//     let result = prediction
//     let attempts = 0
//     const maxAttempts = 60 // 2 minutes max (2 second intervals)

//     while (
//       result.status !== 'succeeded' && 
//       result.status !== 'failed' && 
//       attempts < maxAttempts
//     ) {
//       await new Promise(resolve => setTimeout(resolve, 2000))
      
//       const pollResponse = await fetch(
//         `https://api.replicate.com/v1/predictions/${prediction.id}`,
//         {
//           headers: {
//             'Authorization': `Token ${apiToken}`,
//           },
//         }
//       )

//       result = await pollResponse.json()
//       console.log(`Poll attempt ${attempts + 1}: ${result.status}`)
//       attempts++
//     }

//     if (result.status === 'failed') {
//       throw new Error('Image generation failed: ' + (result.error || 'Unknown error'))
//     }

//     if (result.status !== 'succeeded') {
//       throw new Error('Image generation timed out')
//     }

//     // Get the generated image URL
//     const imageUrl = result.output[0]
//     console.log('Image generated successfully:', imageUrl)

//     return {
//       success: true,
//       imageUrl
//     }

//   } catch (error: any) {
//     console.error('Image generation error:', error)
//     return {
//       success: false,
//       error: error.message
//     }
//   }
// }

// /**
//  * Download image from URL and convert to base64
//  */
// export async function imageUrlToBase64(url: string): Promise<string> {
//   const response = await fetch(url)
//   const arrayBuffer = await response.arrayBuffer()
//   const buffer = Buffer.from(arrayBuffer)
//   return `data:image/png;base64,${buffer.toString('base64')}`
// }