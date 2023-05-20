import React, { useEffect, useState } from 'react'
import {
  getFirestore,
  collection,
  query,
  QuerySnapshot,
  DocumentData,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  QueryDocumentSnapshot,
  updateDoc,
} from 'firebase/firestore'
import {
  ref,
  listAll,
  getDownloadURL,
  deleteObject,
  uploadBytes,
} from 'firebase/storage'
import { storage } from '../config/firebase'
import { DataItem } from '../interface/DataItemInterface'
import Mytest from '../components/Mytest'

const ThePage = () => {
  const [fetchedData, setFetchedData] = useState<DataItem[]>([])
  const [updatedData, setUpdatedData] = useState<DataItem[]>([])
  const [updateName, setUpdateName] = useState<string>('')
  const [updateGithub, setUpdateGithub] = useState<string>('')
  const [updateLive, setUpdateLive] = useState<string>('')
  const [updateItemId, setUpdateItemId] = useState<string | null>(null)
  const [updateImage, setUpdateImage] = useState<File | null>(null)

  const [imageUrls, setImageUrls] = useState<string[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore()
        const collectionRef = collection(db, 'portfolios')
        const q = query(collectionRef)
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q)

        const dataItems: DataItem[] = []

        const imagesList = await listAll(ref(storage, '/images'))

        const imagePromises = imagesList.items.map(async (imageRef) => {
          const imageUrl = await getDownloadURL(imageRef)
          return imageUrl
        })

        const fetchedImageUrls = await Promise.all(imagePromises)
        setImageUrls(fetchedImageUrls)

        querySnapshot.docs.forEach(
          (doc: QueryDocumentSnapshot<DocumentData>, index: number) => {
            const dataItem: DataItem = {
              id: doc.id,
              name: doc.data().name,
              github: doc.data().github,
              live: doc.data().live,
              imageUrl: fetchedImageUrls[index],
              onDelete: () => deleteDataItem(doc.id),
            }
            dataItems.push(dataItem)
          }
        )

        setFetchedData(dataItems)
        setUpdatedData(dataItems)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const deleteDataItem = async (itemId: string) => {
    try {
      const db = getFirestore()
      const itemDoc = doc(db, 'portfolios', itemId)
      const docSnapshot = await getDoc(itemDoc)

      if (!docSnapshot.exists()) {
        console.log('Document does not exist')
        return
      }

      const data = docSnapshot.data()
      const imageUrl = data?.imageUrl

      await deleteDoc(itemDoc)
      setFetchedData((prevData) =>
        prevData.filter((item) => item.id !== itemId)
      )
      setUpdatedData((prevData) =>
        prevData.filter((item) => item.id !== itemId)
      )

      if (imageUrl) {
        const imageRef = ref(storage, imageUrl)
        await deleteObject(imageRef)
        console.log('Image has been deleted successfully')
      }

      console.log('Item has been deleted successfully')
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  const handleUpdateClick = (item: DataItem) => {
    setUpdateItemId(item.id)
    setUpdateName(item.name)
    setUpdateGithub(item.github)
    setUpdateLive(item.live)
  }

  const handleUpdateImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUpdateImage(e.target.files[0])
    }
  }

  const handleUpdate = async () => {
    try {
      if (!updateItemId) {
        console.log('Invalid item ID')
        return
      }

      const db = getFirestore()
      const itemDoc = doc(db, 'portfolios', updateItemId)
      const docSnapshot = await getDoc(itemDoc)

      if (!docSnapshot.exists()) {
        console.log('Document does not exist')
        return
      }

      if (updateImage) {
        // Delete the previous image from Firebase Storage
        const data = docSnapshot.data()
        const imageUrl = data?.imageUrl

        if (imageUrl) {
          const imageRef = ref(storage, imageUrl)
          await deleteObject(imageRef)
          console.log('Previous image has been deleted successfully')
        }

        // Upload the new image to Firebase Storage
        const imageRef = ref(storage, `/images/${updateImage.name}`)
        await uploadBytes(imageRef, updateImage)
        console.log('New image has been uploaded successfully')

        // Get the download URL of the new image
        const newImageUrl = await getDownloadURL(imageRef)

        // Update the document with the new image URL
        await updateDoc(itemDoc, {
          imageUrl: newImageUrl,
        })
        console.log('Item image has been updated successfully')
      }

      // Update the document with other data
      await updateDoc(itemDoc, {
        name: updateName,
        github: updateGithub,
        live: updateLive,
      })

      console.log('Item has been updated successfully')

      await fetchUpdatedData() // Fetch the updated data again
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const fetchUpdatedData = async () => {
    try {
      const db = getFirestore()
      const updatedQuerySnapshot: QuerySnapshot<DocumentData> = await getDocs(
        query(collection(db, 'portfolios'))
      )

      const updatedDataItems: DataItem[] = []
      updatedQuerySnapshot.docs.forEach(
        (doc: QueryDocumentSnapshot<DocumentData>, index: number) => {
          const updatedDataItem: DataItem = {
            id: doc.id,
            name: doc.data().name,
            github: doc.data().github,
            live: doc.data().live,
            imageUrl: imageUrls[index],
            onDelete: () => deleteDataItem(doc.id),
          }
          updatedDataItems.push(updatedDataItem)
        }
      )

      setUpdatedData(updatedDataItems)

      setUpdateItemId(null)
      setUpdateName('')
      setUpdateGithub('')
      setUpdateLive('')
      setUpdateImage(null)
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  return (
    <>
      <div>
        <form>
          <input
            type="text"
            name="name"
            value={updateName}
            onChange={(e) => setUpdateName(e.target.value)}
          />
          <input
            type="text"
            name="github"
            value={updateGithub}
            onChange={(e) => setUpdateGithub(e.target.value)}
          />
          <input
            type="text"
            name="live"
            value={updateLive}
            onChange={(e) => setUpdateLive(e.target.value)}
          />
          <input type="file" name="image" onChange={handleUpdateImageChange} />
          <button onClick={handleUpdate}>Update</button>
        </form>
      </div>
      <div>
        {updatedData.map((item) => (
          <Mytest
            key={item.id}
            item={item}
            handleUpdateClick={handleUpdateClick}
          />
        ))}
      </div>
    </>
  )
}

export default ThePage
