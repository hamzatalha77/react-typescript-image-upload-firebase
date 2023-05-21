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
import { ref, listAll, getDownloadURL, deleteObject } from 'firebase/storage'
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
        console.log('Image has been deleted successfully')
      }

      console.log('Item has been deleted successfully')
    } catch (error) {
      console.error('Error deleting item:', error)
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

      // Reset the update form
      setUpdateItemId(null)
      setUpdateName('')
      setUpdateGithub('')
      setUpdateLive('')
    } catch (error) {
      console.error('Error updating item:', error)
    }
  }

  const handleUpdateClick = (item: DataItem) => {
    setUpdateItemId(item.id)
    setUpdateName(item.name)
    setUpdateGithub(item.github)
    setUpdateLive(item.live)
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

      console.log('Item has been updated successfully')

      await fetchUpdatedData() // Fetch the updated data again
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
          <button type="button" onClick={handleUpdate}>
            Update
          </button>
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
