import { createStackNavigator } from "@react-navigation/stack";
import MarchantOnBoarding from "./MarchantOnBoarding";

const Stack = createStackNavigator();

const MerchantOnBoardingNavigator = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen name="MarchantOnBoarding" component={MarchantOnBoarding} />
        </Stack.Navigator>
    );
};

export default MerchantOnBoardingNavigator;