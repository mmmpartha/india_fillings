import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import TabNavigator from "../../tab/TabNavigation/TabNavigation";

const Stack = createStackNavigator();

const AppNavigator = () => {
    return (
        <Stack.Navigator initialRouteName="TabNavigator">
            <Stack.Screen name="TabNavigator" component={TabNavigator} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

export default AppNavigator;
