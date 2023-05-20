import { useState, useEffect, ChangeEvent } from 'react'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  listAll,
} from 'firebase/storage'
import { getFirestore, collection, addDoc, updateDoc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { storage } from '../config/firebase'
import { v4 as uuidv4 } from 'uuid'

function TheForm(): JSX.Element {
  const [imageUpload, setImageUpload] = useState<File | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [name, setName] = useState<string>('')
  const [github, setGithub] = useState<string>('')
  const [live, setLive] = useState<string>('')
  const [itemId, setItemId] = useState<string>('')
  const navigate = useNavigate()
  const imagesListRef = storageRef(storage, 'images/')

  const uploadFile = async (): Promise<void> => {
    if (
      imageUpload === null ||
      name.trim() === '' ||
      github.trim() === '' ||
      live.trim() === ''
    ) {
      return
    }

    const newImageName = name + uuidv4()
    const imageRef = storageRef(storage, `images/${newImageName}`)

    try {
      const snapshot = await uploadBytes(imageRef, imageUpload)
      const imageUrl = await getDownloadURL(snapshot.ref)

      const imageData = {
        name: name,
        github: github,
        live: live,
        imageUrl: snapshot.ref.fullPath,
      }

      const db = getFirestore()
      const imagesCollection = collection(db, 'portfolios')

      if (itemId) {
        const itemDoc = doc(imagesCollection, itemId)
        await updateDoc(itemDoc, imageData)
        console.log('item updated successfully')
      } else {
        await addDoc(imagesCollection, imageData)
        console.log('Image data stored successfully')
      }

      navigate('/thepage')
    } catch (error) {
      console.error('Error uploading image:', error)
    }
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

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setName(event.target.value)
  }

  const handleGithubChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setGithub(event.target.value)
  }
  const handleLiveChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setLive(event.target.value)
  }

  return (
    <div className="App">
      <input type="file" onChange={handleFileChange} />
      <input
        type="text"
        placeholder="Enter project name"
        value={name}
        onChange={handleNameChange}
      />
      <input
        type="text"
        placeholder="Enter github link"
        value={github}
        onChange={handleGithubChange}
      />
      <input
        type="text"
        placeholder="Enter live url"
        value={live}
        onChange={handleLiveChange}
      />
      <button onClick={uploadFile}>Upload Image</button>
      {imageUrls.map((url) => (
        <img key={url} src={url} alt="Uploaded" />
      ))}
    </div>
  )
}

export default TheForm
