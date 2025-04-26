interface StarRatingProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
}

export default function StarRating({ 
  rating, 
  maxRating = 5, 
  interactive = false, 
  onRatingChange 
}: StarRatingProps) {
  const handleStarClick = (index: number) => {
    if (interactive && onRatingChange) {
      // Add 1 because index is zero-based
      onRatingChange(index + 1);
    }
  };

  return (
    <div className="flex">
      {Array.from({ length: maxRating }).map((_, index) => (
        <svg
          key={index}
          className={`h-5 w-5 flex-shrink-0 ${
            index < rating ? 'text-yellow-400' : 'text-gray-300'
          } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
          onClick={() => handleStarClick(index)}
          onMouseEnter={() => {
            if (interactive && onRatingChange) {
              const stars = document.querySelectorAll('.star-rating-item');
              // Highlight stars on hover (preview)
              for (let i = 0; i < stars.length; i++) {
                if (i <= index) {
                  stars[i].classList.add('text-yellow-400');
                  stars[i].classList.remove('text-gray-300');
                } else {
                  stars[i].classList.add('text-gray-300');
                  stars[i].classList.remove('text-yellow-400');
                }
              }
            }
          }}
        >
          <path className="star-rating-item" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}
