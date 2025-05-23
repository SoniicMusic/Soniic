import { redirect } from "next/navigation";

const NODE_ENV = process.env.NODE_ENV;

/**
 * Builds a URL for redirection based on environment
 * @param url The relative URL to redirect to
 * @returns The fully qualified URL for redirection
 */
export function buildRedirectUrl(url: string): string {
  console.log('buildRedirectUrl called with:', { url, NODE_ENV });
  
  if (NODE_ENV === 'production') {
    const result = `https://${url}`;
    console.log('Production redirect URL:', result);
    return result;
  } else if (NODE_ENV === 'development') {
    // Build redirect URL for development
    const domain = url.split('/')[0];
    const path = url.split('/').slice(1).join('/');
    const result = `http://${domain}.localhost:3000/${path}`;
    console.log('Development redirect URL:', { domain, path, result });
    return result;
  } else {
    console.warn('Unknown environment for redirection');
    return url;
  }
}

/**
 * Performs a redirect - Use this in client components or pages, not in server actions
 * @param url The URL to redirect to
 */
export function dynamicRedirect(url: string) {
  redirect(buildRedirectUrl(url));
}