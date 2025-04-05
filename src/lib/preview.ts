import { NextApiRequest, NextApiResponse } from 'next';
import { GetStaticPropsContext } from 'next';

/**
 * Enables preview mode for the current session
 * 
 * @param req The Next.js API request
 * @param res The Next.js API response
 * @param previewData Optional data to store in the preview session
 */
export function enablePreviewMode(
  req: NextApiRequest,
  res: NextApiResponse,
  previewData: any = {}
) {
  res.setPreviewData(previewData);
  
  // Redirect to the path specified in the query
  const redirectPath = req.query.redirect as string || '/';
  res.redirect(redirectPath);
}

/**
 * Disables preview mode for the current session
 * 
 * @param req The Next.js API request
 * @param res The Next.js API response
 */
export function disablePreviewMode(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.clearPreviewData();
  
  // Redirect to the path specified in the query
  const redirectPath = req.query.redirect as string || '/';
  res.redirect(redirectPath);
}

/**
 * Checks if the current request is in preview mode
 * 
 * @param context The Next.js context
 * @returns Whether preview mode is active
 */
export function isPreviewMode(context: GetStaticPropsContext): boolean {
  return context?.preview === true;
}
