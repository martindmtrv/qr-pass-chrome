import { BarCodeScanner, BarCodeScannedCallback } from 'expo-barcode-scanner';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(true);
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");

  useEffect(() => {
    (async () => {
      const {status} = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission((status === "granted") as any);
    })();
  }, []);

  const handleBarCodeScanned: BarCodeScannedCallback = ({type, data}) => {
    setScanned(true);
    // change this to the right url
    fetch(`http://192.168.0.110:5000/password/${data}`, {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({pw: pw}),
    }).then(res => {
      if (res.status === 200) {
        alert("Success! Password was beamed");
      }
      setPw("");
    })
    .catch((e) => alert(`Something went wrong! ${e}`))
  }

  if (hasPermission === null) {
    return <Text>Requesting for camera access</Text>;
  }

  if (hasPermission === false) {
    return <Text>No camera access</Text>;
  }

  return (
    <View style={styles.container}>
      {scanned ? 
        <>
          <Text style={{margin: 4}}>Password to beam</Text>
          <TextInput
            style={{ height: 40, width: 200, margin: 16, borderColor: 'gray', borderWidth: 1 }}
            onChangeText={text => setPw(text)}
            secureTextEntry={true}
            value={pw}
          />
          <Button title={"Scan QR to fill password"} onPress={() => setScanned(false)} />
        </>: 
        <>
          <BarCodeScanner 
            style={StyleSheet.absoluteFillObject} 
            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} 
            barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]} 
          />

        </>
      }
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
