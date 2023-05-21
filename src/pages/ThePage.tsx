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
  uploadBytes,
  getDownloadURL,
  deleteObject,
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

  // ...

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore()
        const collectionRef = collection(db, 'portfolios')
        const q = query(collectionRef)
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q)

        const dataItems: DataItem[] = []
        const fetchedImageUrls: string[] = [] // Store the fetched image URLs

        querySnapshot.docs.forEach(
          (doc: QueryDocumentSnapshot<DocumentData>) => {
            const dataItem: DataItem = {
              id: doc.id,
              name: doc.data().name,
              github: doc.data().github,
              live: doc.data().live,
              imageUrl: '', // Initially set the imageUrl to an empty string
              onDelete: () => deleteDataItem(doc.id),
            }
            dataItems.push(dataItem)

            // Fetch image URL for each data item and store it in the fetchedImageUrls array
            getDownloadURL(ref(storage, doc.data().imageUrl))
              .then((url) => {
                dataItem.imageUrl = url
                fetchedImageUrls.push(url)

                // Check if all image URLs have been fetched
                if (fetchedImageUrls.length === querySnapshot.size) {
                  // All image URLs have been fetched, update the state
                  setFetchedData(dataItems)
                  setUpdatedData(dataItems)
                  setImageUrls(fetchedImageUrls)
                }
              })
              .catch((error) => {
                console.error('Error fetching image URL:', error)
              })
          }
        )
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  // ...

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
        console.log('Image has been deleted')
      }

      console.log('Item has been deleted successfully')
    } catch (error) {
      console.error('Error deleting item:', error)
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

      await updateDoc(itemDoc, {
        name: updateName,
        github: updateGithub,
        live: updateLive,
      })

      if (updateImage) {
        const prevImageUrl = docSnapshot.data()?.imageUrl
        if (prevImageUrl) {
          const prevImageRef = ref(storage, prevImageUrl)
          await deleteObject(prevImageRef)
          console.log('Previous image has been deleted')
        }

        const imageRef = ref(storage, `images/${updateImage.name}`)
        await uploadBytes(imageRef, updateImage)
        const imageUrl = await getDownloadURL(imageRef)

        await updateDoc(itemDoc, {
          imageUrl: imageUrl,
        })

        console.log('New image has been uploaded and URL has been updated')
      }

      console.log('Item has been updated successfully')

      await fetchUpdatedData()
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const fetchUpdatedData = async () => {
    try {
      const db = getFirestore()
      const collectionRef = collection(db, 'portfolios')
      const q = query(collectionRef)
      const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q)

      const dataItems: DataItem[] = []
      const fetchedImageUrls: string[] = []

      querySnapshot.docs.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
        const dataItem: DataItem = {
          id: doc.id,
          name: doc.data().name,
          github: doc.data().github,
          live: doc.data().live,
          imageUrl: '',
          onDelete: () => deleteDataItem(doc.id),
        }
        dataItems.push(dataItem)

        getDownloadURL(ref(storage, doc.data().imageUrl))
          .then((url) => {
            dataItem.imageUrl = url
            fetchedImageUrls.push(url)

            if (fetchedImageUrls.length === querySnapshot.size) {
              setFetchedData(dataItems)
              setUpdatedData(dataItems)
              setImageUrls(fetchedImageUrls)
            }
          })
          .catch((error) => {
            console.error('Error fetching image URL:', error)
          })
      })
    } catch (error) {
      console.error('Error fetching updated data:', error)
    }
  }

  return (
    <div>
      <h2>Update Items</h2>
      <div>
        {updatedData.map((item: DataItem) => (
          <Mytest
            key={item.id}
            name={item.name}
            github={item.github}
            live={item.live}
            imageUrl={item.imageUrl}
            onDelete={item.onDelete}
            onEdit={() => {
              setUpdateName(item.name)
              setUpdateGithub(item.github)
              setUpdateLive(item.live)
              setUpdateItemId(item.id)
            }}
          />
        ))}
      </div>
      <h2>Add New Item</h2>
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
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setUpdateImage(e.target.files?.[0])}
        />
        <button type="button" onClick={handleUpdate}>
          Update Item
        </button>
      </form>
    </div>
  )
}

export default ThePage
