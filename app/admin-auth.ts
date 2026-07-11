import{notFound}from"next/navigation";import{getChatGPTUser,type ChatGPTUser}from"./chatgpt-auth";
export async function getLeemingAdmin():Promise<ChatGPTUser|null>{const user=await getChatGPTUser();if(!user)return null;if(process.env.NODE_ENV==="development"&&user.email==="local@leeming.dev")return user;const adminEmail=process.env.ADMIN_EMAIL?.trim().toLowerCase();return adminEmail&&user.email.toLowerCase()===adminEmail?user:null}
export async function requireLeemingAdmin():Promise<ChatGPTUser>{const user=await getLeemingAdmin();if(!user)notFound();return user}
