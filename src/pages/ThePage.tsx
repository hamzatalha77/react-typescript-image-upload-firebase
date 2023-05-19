import { useEffect, useState } from 'react'
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
  QueryDocumentSnapshot, // Update the import statement for QueryDocumentSnapshot
} from 'firebase/firestore'
import { ref, listAll, getDownloadURL } from 'firebase/storage'
import { storage } from '../config/firebase'
import { DataItem } from '../interface/DataItemInterface'
import Mytest from '../components/Mytest'

const ThePage = () => {
  const [data, setData] = useState<DataItem[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore()
        const collectionRef = collection(db, 'portfolios')
        const q = query(collectionRef)
        const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q)

        const dataItems: DataItem[] = []

        // Fetch images from Firebase Storage
        const imagesList = await listAll(ref(storage, '/images'))

        // Get download URLs for each image
        const imagePromises = imagesList.items.map(async (imageRef) => {
          const imageUrl = await getDownloadURL(imageRef)
          return imageUrl
        })

        const imageUrls = await Promise.all(imagePromises)

        querySnapshot.docs.forEach(
          (doc: QueryDocumentSnapshot<DocumentData>, index: number) => {
            const dataItem: DataItem = {
              id: doc.id,
              name: doc.data().name,
              github: doc.data().github,
              live: doc.data().live,
              imageUrl: imageUrls[index],
              onDelete: () => deleteDataItem(doc.id), // Pass the document ID to deleteDataItem
            }
            dataItems.push(dataItem)
          }
        )

        setData(dataItems)
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

      // Check if the document exists before deleting
      const docSnapshot = await getDoc(itemDoc)
      if (!docSnapshot.exists()) {
        console.log('Document does not exist')
        return
      }

      // Delete the Firestore document
      await deleteDoc(itemDoc)
      setData((prevData) => prevData.filter((item) => item.id !== itemId))

      console.log('Item has been deleted successfully')
    } catch (error) {
      console.error('Error deleting item:', error)
    }
  }

  return (
    <div>
      {data.map((item) => (
        <Mytest key={item.id} item={item} /> // Pass 'item' prop to Mytest component
      ))}
    </div>
  )
}

export default ThePage
