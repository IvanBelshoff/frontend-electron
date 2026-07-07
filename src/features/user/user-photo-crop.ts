import type { Area } from 'react-easy-crop'

export const PHOTO_OUTPUT_SIZE = 512
export const PHOTO_OUTPUT_TYPE = 'image/webp'
export const PHOTO_OUTPUT_QUALITY = 0.9

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()

    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', () => reject(new Error('Não foi possível carregar a imagem selecionada.')))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}

function getRadianAngle(degreeValue: number): number {
  return (degreeValue * Math.PI) / 180
}

function rotateSize(width: number, height: number, rotation: number): { width: number; height: number } {
  const rotRad = getRadianAngle(rotation)

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

export async function getCroppedPhotoBlob(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) {
    throw new Error('Não foi possível preparar a imagem para envio.')
  }

  const rotRad = getRadianAngle(rotation)
  const { width: boundingWidth, height: boundingHeight } = rotateSize(
    image.width,
    image.height,
    rotation,
  )

  canvas.width = boundingWidth
  canvas.height = boundingHeight

  context.translate(boundingWidth / 2, boundingHeight / 2)
  context.rotate(rotRad)
  context.translate(-image.width / 2, -image.height / 2)
  context.drawImage(image, 0, 0)

  const croppedCanvas = document.createElement('canvas')
  const croppedContext = croppedCanvas.getContext('2d')

  if (!croppedContext) {
    throw new Error('Não foi possível gerar a foto recortada.')
  }

  croppedCanvas.width = pixelCrop.width
  croppedCanvas.height = pixelCrop.height

  croppedContext.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  )

  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = PHOTO_OUTPUT_SIZE
  outputCanvas.height = PHOTO_OUTPUT_SIZE

  const outputContext = outputCanvas.getContext('2d')

  if (!outputContext) {
    throw new Error('Não foi possível gerar a foto recortada.')
  }

  outputContext.imageSmoothingEnabled = true
  outputContext.imageSmoothingQuality = 'high'
  outputContext.drawImage(croppedCanvas, 0, 0, PHOTO_OUTPUT_SIZE, PHOTO_OUTPUT_SIZE)

  return new Promise((resolve, reject) => {
    outputCanvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Não foi possível gerar a foto recortada.'))
          return
        }

        resolve(blob)
      },
      PHOTO_OUTPUT_TYPE,
      PHOTO_OUTPUT_QUALITY,
    )
  })
}
