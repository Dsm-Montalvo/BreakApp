export const colors = {
  primary: '#1a90f0ff',
  secondary: '#1d28eaff',
  //background: '#69015A',
  background: '#b8d1e7',
  text: '#333333',
  white: '#ffffff',
  black: '#000000',
  red: '#B3261E',
  lightGray: '#ecf0f1',
  darkGray: '#7f8c8d',
  error: '#e74c3c',
  tittle: '#6FA0E4',
  subtittle: '#ffffffff',
  subbox: '#64a6e3',
  
};

export const theme = {
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: colors.white,
    borderColor: colors.red,
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginVertical: 10,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  oval1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#6FA0E4', // azul claro
    top: -50,
    left: -50,
    zIndex: -1,
  },
  oval2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#FFD166', // amarillo suave
    bottom: 50,
    right: -30,
    zIndex: -1,
  },
  oval3: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EF476F', // rosa
    bottom: 150,
    left: -20,
    zIndex: -1,
  },
};