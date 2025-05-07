import { redirect } from "next/navigation";

const NODE_ENV = process.env.NODE_ENV;

export function dynamicRedirect(url: string) {
  if (NODE_ENV === 'production') {
    redirect(`https://${url}`);
  } else if (NODE_ENV === 'development') {
    // Redirect in development
    // get domain from beginning of url and add port before the rest of the url
    const domain = url.split('/')[0];
    const path = url.split('/').slice(1).join('/');
    redirect(`http://${domain}:3000/${path}`);
  } else {
    console.warn('No redirect for this environment');
  }

  }