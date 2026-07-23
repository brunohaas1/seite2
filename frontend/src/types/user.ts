export interface UserDTO {
  id: string;
  email: string;
  name: string;
  photo_url: string | null;
  is_verified: boolean;
  is_active: boolean;
}
