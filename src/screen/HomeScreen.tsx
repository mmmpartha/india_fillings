import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TextInput,
  Button,
  TouchableWithoutFeedback,
  Keyboard,
  Animated,
  TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Camera, useCameraDevice, useCodeScanner } from "react-native-vision-camera";

const QRScanner = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [scannedCode, setScannedCode] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [modalAnim] = useState(new Animated.Value(300)); 

  const device = useCameraDevice("back");

  useEffect(() => {
    const requestCameraPermission = async () => {
      const status = await Camera.requestCameraPermission();
      if (status === "granted") {
        setHasPermission(true);
      } else {
        Alert.alert("Permission Denied", "Camera access is required to scan barcodes.");
      }
    };

    requestCameraPermission();
  }, []);

  const showModal = () => {
    setModalVisible(true);
    Animated.timing(modalAnim, {
      toValue: 0, 
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const hideModal = () => {
    Animated.timing(modalAnim, {
      toValue: 300,
      duration: 500,
      useNativeDriver: true,
    }).start(() => setModalVisible(false));
  };

  const checkLocalStorage = async (code) => {
    try {
      const storedProducts = await AsyncStorage.getItem("products");
      const products = storedProducts ? JSON.parse(storedProducts) : [];

      const existingProduct = products.find((p) => p.code === code);

      if (existingProduct) {
        Alert.alert("Product Found", `Product already exists: ${existingProduct.name}`);
      } else {
        setScannedCode(code);
        showModal(); 
      }
    } catch (error) {
      console.error("Error checking local storage:", error);
    }
  };

  const handleSubmit = async () => {
    if (!productName || !price || !quantity) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }

    const newProduct = {
      id: Date.now(),
      code: scannedCode,
      name: productName,
      price: parseFloat(price),
      quantity: parseInt(quantity, 10),
    };

    try {
      const storedProducts = await AsyncStorage.getItem("products");
      const products = storedProducts ? JSON.parse(storedProducts) : [];
      products.push(newProduct);
      await AsyncStorage.setItem("products", JSON.stringify(products));
      
      Alert.alert("Success", "Product added successfully!");
      setProductName("");
      setPrice("");
      setQuantity("");
      hideModal(); 
    } catch (error) {
      console.error("Error saving product:", error);
    }
  };

  const codeScanner = useCodeScanner({
    codeTypes: ["qr", "ean-13"],
    onCodeScanned: (codes) => {
      if (codes.length > 0) {
        const scannedValue = codes[0].value;
        console.log(`Scanned Code: ${scannedValue}`);
        checkLocalStorage(scannedValue);
      }
    },
  });

  if (!device) return <Text style={styles.errorText}>No Camera Found</Text>;
  if (!hasPermission) return <Text style={styles.errorText}>Camera permission required</Text>;

  return (
    <View style={styles.container}>
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        codeScanner={codeScanner}
      />

      {modalVisible && (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <Animated.View style={[styles.modalContainer, { transform: [{ translateY: modalAnim }] }]}>
            <Text style={styles.modalTitle}>Enter Product Details</Text>

            <TextInput
              style={styles.input}
              placeholder="Product Name"
              value={productName}
              onChangeText={setProductName}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              keyboardType="numeric"
              value={quantity}
              onChangeText={setQuantity}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={hideModal}>
                <Text style={styles.buttonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  errorText: {
    flex: 1,
    textAlign: "center",
    textAlignVertical: "center",
    fontSize: 18,
    color: "red",
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    height: 45,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  submitButton: {
    backgroundColor: "#28a745",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  closeButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
});

export default QRScanner;
