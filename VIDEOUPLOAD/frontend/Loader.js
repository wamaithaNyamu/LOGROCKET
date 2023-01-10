import { ActivityIndicator, View,Text } from "react-native";


const Loader = () => {
    return (
        <View className="bg-white h-screen flex justify-center">

            <ActivityIndicator size="large" color="#4D7902" />
            <Text className="text-pink-900 text-center" >Loading...</Text>
        </View>
    )
}

export default Loader