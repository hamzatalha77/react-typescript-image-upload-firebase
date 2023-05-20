import { useState, useEffect, ChangeEvent } from 'react'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  listAll,
} from 'firebase/storage'
import {
  getFirestore,
  collection,
  updateDoc,
  doc,
  getDoc,
  addDoc,
} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { storage } from '../config/firebase'
import { v4 as uuidv4 } from 'uuid'

interface TheFormProps {
  itemId?: string
}

function TheForm({ itemId }: TheFormProps): JSX.Element {
  const [imageUpload, setImageUpload] = useState<File | null>(null)
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [name, setName] = useState<string>('')
  const [github, setGithub] = useState<string>('')
  const [live, setLive] = useState<string>('')
  const [image, setImage] = useState<string>('')
  const navigate = useNavigate()
  const imagesListRef = storageRef(storage, 'images/')

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const db = getFirestore()
        const itemDoc = doc(collection(db, 'portfolios'), itemId)
        const itemSnapshot = await getDoc(itemDoc)

        if (itemSnapshot.exists()) {
          const itemData = itemSnapshot.data()
          if (itemData) {
            setName(itemData.name)
            setGithub(itemData.github)
            setLive(itemData.live)
            setImage(itemData.imageUrl)
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    if (itemId) {
      fetchData()
    }
  }, [itemId])

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
        console.log('Item updated successfully')
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
      {image && <img src={image} alt="Fetched Image" />}

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
