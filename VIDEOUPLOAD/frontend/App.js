import { ScrollView, RefreshControl, Text,  View, Alert, Pressable} from 'react-native';
import Video from 'react-native-video';
import DocumentPicker from 'react-native-document-picker'
import { useEffect, useState } from 'react'
import axios from 'axios';

import Loader from './Components/Loader.js';
const API_ENDPOINT = 'https://1e41-105-163-156-83.in.ngrok.io/api/uploads'

const App = () => {
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState([])
  const [fetching, setFetching] = useState(false)
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getAllMedia().then((urls) => {
      setFiles(urls)
      setFetching(false)
    })
  }, [])

  const handleError = (e) => {
    if (DocumentPicker.isCancel(e)) {
      Alert.alert('Upload Cancelled')
    } else {
      Alert.alert('Unknown Error: ' + JSON.stringify(e))
    }
  }

  const handleUpload = async () => {
    try {

      setUploading(true)

      const pickerResult = await DocumentPicker.pickSingle({
        type: ['video/*'],
        presentationStyle: 'fullScreen',
        copyTo: 'cachesDirectory',
      })

      const body = new FormData();

      body.append('files', {
        uri: pickerResult.fileCopyUri,
        type: pickerResult.type,
        name: pickerResult.name,
      });


      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Content-Disposition': 'form-data',
        }
      }

      const response = await axios.post(API_ENDPOINT, body, config)
      if (response.status === 200) {
        Alert.alert('Upload Successful')
      }

      if (response.status === 500) {
        Alert.alert('Server error')
      }

      if (response.status === 403) {
        Alert.alert('Error uploading document.')
      }


      setUploading(false)

    } catch (e) {
      console.log(e.response)
      handleError(e)

    }
  }

  const getAllMedia = async () => {
    try {
      setFetching(true)
      const response = await axios.get(API_ENDPOINT)
      return response.data

    } catch (e) {
      console.log(e)
      Alert.alert('Unknown Error: ' + JSON.stringify(e))
    }
  }

  return (
    <View className="h-full p-10 flex justify-start text-md font-bold text-emerald-900 bg-white">
      <Pressable
        onPress={handleUpload} >
        <Text className=" bg-pink-900 text-white rounded-md p-3 text-center">Upload Media</Text>
      </Pressable>

      <ScrollView
        className="mt-10"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={
              () => {
                setRefreshing(true);
                getAllMedia().then((urls) => {
                  console.log(urls)
                  setFiles(urls)
                  setFetching(false)
                  setRefreshing(false);
                })
              }
            }
          />
        }>

        {uploading || fetching ? <Loader /> :
          <>
            {files.map((file, index) => {
              return (
                <View key={index} className="border border-pink-900 h-60 m-2 ">
                  <Video
                    className="absolute top-0 left-0 bottom-0 right-0"
                    key={index}
                    paused={false}
                    repeat={true}
                    source={{ uri: file }}
                    controls={true}
                  />
                </View>
              )
            })}
          </>
        }

      </ScrollView>
    </View>
  );
};
export default App;
