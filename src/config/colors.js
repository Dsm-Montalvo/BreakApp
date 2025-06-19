export const colors = {
  primary: '#3498db',
  secondary: '#2ecc71',
  background: '#69015A',
  text: '#333333',
  white: '#ffffff',
  black: '#000000',
  gray: '#95a5a6',
  lightGray: '#ecf0f1',
  darkGray: '#7f8c8d',
  error: '#e74c3c',
  tittle: '#6FA0E4',
  subtittle: '#A3A1A7',
  subbox: '#B42BC0',
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
    borderColor: colors.gray,
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
    marginBottom: 30,
  },
};