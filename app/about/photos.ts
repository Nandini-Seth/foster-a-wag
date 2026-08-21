/**
 * Photos for the About Us carousel.
 *
 * Files live in public/about/. Any entry whose file is missing is skipped at
 * runtime rather than showing a broken image, so the carousel still looks
 * finished while photos are being added or swapped.
 *
 * Filenames are matched exactly, extension case included: macOS treats .JPG and
 * .jpg as the same file but the Linux filesystem on Cloud Run does not, so a
 * mismatch here works locally and 404s in production.
 *
 * Ordered as a rough story — puppies, growing up, then the two of them together.
 */
export type AboutPhoto = { src: string; alt: string };

export const ABOUT_PHOTOS: AboutPhoto[] = [
  { src: '/about/iris-puppy-leaf.jpg', alt: 'Iris as a puppy, looking up beside a bright red maple leaf' },
  { src: '/about/lily-puppy-leaf.jpeg', alt: 'Lily as a puppy, sitting in the grass beside a red maple leaf' },
  { src: '/about/iris-puppy-harness.jpg', alt: 'Iris as a puppy on the brick porch in her blue collar and harness' },
  { src: '/about/iris-graduation.jpeg', alt: 'Iris grinning up at the camera on her graduation day' },
  { src: '/about/iris-snow.JPG', alt: 'Iris sitting in deep snow with her eyes closed in the winter sun' },
  { src: '/about/iris-smile-barn.jpg', alt: 'Iris beaming, close up, in a straw-filled barn' },
  { src: '/about/iris-sleepy.JPG', alt: 'Iris dozing off, tucked under a soft blanket' },
  { src: '/about/lily-deck.JPG', alt: 'Lily stretched out on the patio couch in the back garden' },
  { src: '/about/lily-tongue.JPG', alt: 'Lily with her tongue out, riding along with the roof down' },
  { src: '/about/lily-sleepy.JPG', alt: 'Lily curled into a quiet corner of the kitchen for a nap' },
  { src: '/about/iris-lily-cuddle.JPG', alt: 'Iris and Lily asleep with their heads resting together' },
  { src: '/about/iris-lily-leash.JPG', alt: 'Iris and Lily playing tug with a leash across the kitchen floor' },
  { src: '/about/iris-lily-bandana.JPG', alt: 'Iris and Lily in matching Canada bandanas, waiting for a treat' },
];
