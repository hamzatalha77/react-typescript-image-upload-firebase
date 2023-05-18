import { useEffect, useState } from 'react'
import {
  getFirestore,
  collection,
  query,
  QuerySnapshot,
  DocumentData,
  getDocs,
} from 'firebase/firestore'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '../config/firebase'

interface DataItem {
  id: string
  name: string
  // Other properties...
}

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
        querySnapshot.forEach((doc) => {
          const dataItem: DataItem = {
            id: doc.id,
            name: doc.data().name,
          }
          dataItems.push(dataItem)
        })

        setData(dataItems)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}

export default ThePage
