export const ACCESS_MEMORY_3D_URL =
  'http://127.0.0.1:8080/gs_campus/demo/accessmemory.html';

export const sceneUrl = (scene: string) =>
  `${ACCESS_MEMORY_3D_URL}?scene=${encodeURIComponent(scene)}`;
