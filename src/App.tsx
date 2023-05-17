import { useState, useEffect, ChangeEvent } from 'react'
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage'
import { storage } from './config/firebase'
import { v4 as uuidv4 } from 'uuid'

function App(): JSX.Element {
  const [imageUpload, setImageUpload] = useState<File | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])

  const imagesListRef = ref(storage, 'images/')

  const uploadFile = (): void => {
    if (imageUpload === null) return
    const imageName = imageUpload.name + uuidv4()
    const imageRef = ref(storage, `images/${imageName}`)
    uploadBytes(imageRef, imageUpload).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        setImageUrls((prev) => [...prev, url])
      })
    })
  }

  useEffect(() => {
    listAll(imagesListRef)
      .then((response) =>
        Promise.all(response.items.map((item) => getDownloadURL(item)))
      )
      .then((urls) => {
        setImageUrls(urls)
      })
      .catch((error) => {
        console.error('Error fetching images:', error)
      })
  }, [])

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>): void => {
    if (event.target.files && event.target.files[0]) {
      setImageUpload(event.target.files[0])
    }
  }

  return (
    <div className="App">
      <input type="file" onChange={handleFileChange} />
      <button onClick={uploadFile}>Upload Image</button>
      {imageUrls.map((url) => (
        <img key={url} src={url} alt="Uploaded" />
      ))}
    </div>
  )
}

export default App
