export const getData = {
  movie: async () => {
    const response = await fetch("assets/data/index.json");
    const data = await response.json();
    return data;
  },
  tokusatsu: async () => {
    const response = await fetch("assets/data/tokusatsu.json");
    const data = await response.json();
    return data;
  },
}; 