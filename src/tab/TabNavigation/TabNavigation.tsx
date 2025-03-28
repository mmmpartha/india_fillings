import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Image } from "react-native";
import HomeScreen from "../../screen/HomeScreen";
import ProductList from "../../screen/ProductList";
import Cart from "../../screen/Cart";

import getIconSource from "../../navigation/stack/getIconSource";

type RouteName = "Home" | "ProductList" | "Cart";

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => (
                    <Image
                        source={getIconSource(route.name as RouteName, focused)}
                        style={{ width: 25, height: 25, resizeMode: "contain" }}
                    />
                ),
                tabBarShowLabel: false,
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="ProductList" component={ProductList} />
            <Tab.Screen name="Cart" component={Cart} />
        </Tab.Navigator>
    );
};

export default TabNavigator;
