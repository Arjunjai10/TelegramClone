// Empty mock for react-native-reanimated on web
export default {
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    useAnimatedProps: () => ({}),
    useDerivedValue: (f: any) => ({ value: f() }),
    withTiming: (v: any) => v,
    withSpring: (v: any) => v,
    withDelay: (t: number, v: any) => v,
    withSequence: () => { },
    runOnUI: (f: any) => f,
    runOnJS: (f: any) => f,
    createAnimatedComponent: (c: any) => c,
    View: 'div',
    Text: 'span',
    Image: 'img',
    ScrollView: 'div',
};
