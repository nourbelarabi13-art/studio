import ReadingView from "@/components/reading-view";

/**
 * Static Export Configuration for Rosaline Bela.
 * Ensures the build process generates necessary HTML artifacts.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return [{ id: 'manifest' }];
}

export default async function ReadingPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <ReadingView id={params.id} />;
}
