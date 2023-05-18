import { useEffect, useState } from 'react'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { ref, getDownloadURL } from 'firebase/storage'
import { storage } from '../config/firebase'

const ThePage = () => {
  const [imageUrl, setImageUrl] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = getFirestore() // Create Firestore instance
        const querySnapshot = await getDocs(collection(db, 'portfolios'))
        querySnapshot.forEach(async (doc) => {
          const imageUrl = await getDownloadURL(
            ref(storage, doc.data().imagePath)
          )
          setImageUrl(imageUrl)
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  return <div>{imageUrl && <img src={imageUrl} alt="Fetched Image" />}</div>
}

export default ThePage
