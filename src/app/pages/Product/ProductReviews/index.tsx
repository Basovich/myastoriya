import React, { useState } from 'react';
import clsx from 'clsx';
import styles from '../Product.module.scss';
import Button from '@/app/components/ui/Button/Button';
import SectionHeader from '@/app/components/ui/SectionHeader/SectionHeader';
import Image from 'next/image';

import ReviewModal from '@/app/components/ReviewModal';
import { Review as BaseReview } from '@/i18n/types';

interface Review extends BaseReview {
    scores?: Record<string, number>;
}

interface ProductReviewsProps {
    reviews: Review[];
    isAuthenticated?: boolean;
    onAuthRequired?: () => void;
    onVideoReviewRequired?: () => void;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ 
    reviews, 
    isAuthenticated, 
    onAuthRequired,
    onVideoReviewRequired
}) => {
    const [activeTab, setActiveTab] = useState<'text' | 'video'>('text');
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [visibleCount, setVisibleCount] = useState(3);

    const showMore = () => {
        setVisibleCount(prev => prev + 5);
    };

    const handleVideoReviewClick = () => {
        if (!isAuthenticated) {
            onAuthRequired?.();
        } else {
            onVideoReviewRequired?.();
        }
    };

    return (
        <div className={styles.reviewsSection} id="reviews">
            <SectionHeader title="ВІДГУКИ НАШИХ КЛІЄНТІВ" classNameWrapper={styles.reviewsTitle} />
            
            <div className={styles.reviewsControls}>
                <div className={styles.reviewsTabs}>
                    <Button 
                        variant={activeTab === 'text' ? 'black' : 'outline-black'}
                        className={clsx(styles.reviewTabBtn, activeTab === 'text' && styles.active)}
                        onClick={() => setActiveTab('text')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 3.99994H4C3.78783 3.99994 3.58434 4.08423 3.43431 4.23426C3.28429 4.38428 3.2 4.58776 3.2 4.79993C3.2 5.0121 3.28429 5.21558 3.43431 5.36561C3.58434 5.51564 3.78783 5.59992 4 5.59992H12C12.2122 5.59992 12.4157 5.51564 12.5657 5.36561C12.7157 5.21558 12.8 5.0121 12.8 4.79993C12.8 4.58776 12.7157 4.38428 12.5657 4.23426C12.4157 4.08423 12.2122 3.99994 12 3.99994ZM12 7.1999H4C3.78783 7.1999 3.58434 7.28418 3.43431 7.43421C3.28429 7.58424 3.2 7.78772 3.2 7.99989C3.2 8.21206 3.28429 8.41554 3.43431 8.56557C3.58434 8.71559 3.78783 8.79988 4 8.79988H12C12.2122 8.79988 12.4157 8.71559 12.5657 8.56557C12.7157 8.41554 12.8 8.21206 12.8 7.99989C12.8 7.78772 12.7157 7.58424 12.5657 7.43421C12.4157 7.28418 12.2122 7.1999 12 7.1999ZM13.6 0H2.4C1.76348 0 1.15303 0.252853 0.702944 0.702934C0.252856 1.15302 0 1.76346 0 2.39997V10.3999C0 11.0364 0.252856 11.6468 0.702944 12.0969C1.15303 12.547 1.76348 12.7998 2.4 12.7998H11.672L14.632 15.7678C14.7068 15.8419 14.7954 15.9006 14.8929 15.9404C14.9903 15.9802 15.0947 16.0004 15.2 15.9998C15.3049 16.0025 15.4091 15.9806 15.504 15.9358C15.6501 15.8758 15.7752 15.7738 15.8634 15.6429C15.9517 15.5119 15.9992 15.3577 16 15.1998V2.39997C16 1.76346 15.7471 1.15302 15.2971 0.702934C14.847 0.252853 14.2365 0 13.6 0ZM14.4 13.2718L12.568 11.4318C12.4932 11.3577 12.4046 11.299 12.3071 11.2592C12.2097 11.2194 12.1053 11.1992 12 11.1998H2.4C2.18783 11.1998 1.98434 11.1156 1.83431 10.9655C1.68429 10.8155 1.6 10.612 1.6 10.3999V2.39997C1.6 2.1878 1.68429 1.98432 1.83431 1.83429C1.98434 1.68426 2.18783 1.59998 2.4 1.59998H13.6C13.8122 1.59998 14.0157 1.68426 14.1657 1.83429C14.3157 1.98432 14.4 2.1878 14.4 2.39997V13.2718Z" fill="white"/>
                        </svg>
                        Відгуки
                    </Button>
                    <Button 
                        variant={activeTab === 'video' ? 'black' : 'outline-black'}
                        className={clsx(styles.reviewTabBtn, activeTab === 'video' && styles.active)}
                        onClick={() => setActiveTab('video')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="14" viewBox="0 0 18 14" fill="none">
                            <path d="M11.601 5.67L8.901 4.1475C8.66112 4.00971 8.38761 3.93703 8.109 3.93703C7.83039 3.93703 7.55688 4.00971 7.317 4.1475C7.07529 4.27997 6.87491 4.47352 6.73707 4.70765C6.59924 4.94177 6.52907 5.20778 6.534 5.4775V8.5225C6.52907 8.79222 6.59924 9.05823 6.73707 9.29235C6.87491 9.52648 7.07529 9.72003 7.317 9.8525C7.55688 9.99029 7.83039 10.063 8.109 10.063C8.38761 10.063 8.66112 9.99029 8.901 9.8525L11.601 8.33C11.8318 8.19226 12.0225 7.99929 12.1547 7.7695C12.287 7.53972 12.3564 7.28081 12.3564 7.0175C12.3564 6.75419 12.287 6.49528 12.1547 6.2655C12.0225 6.03571 11.8318 5.84274 11.601 5.705V5.67ZM8.316 8.155V5.845L10.368 7L8.316 8.155ZM15.3 0H2.7C1.98392 0 1.29716 0.276562 0.790812 0.768845C0.284464 1.26113 0 1.92881 0 2.625V11.375C0 12.0712 0.284464 12.7389 0.790812 13.2312C1.29716 13.7234 1.98392 14 2.7 14H15.3C16.0161 14 16.7028 13.7234 17.2092 13.2312C17.7155 12.7389 18 12.0712 18 11.375V2.625C18 1.92881 17.7155 1.26113 17.2092 0.768845C16.7028 0.276562 16.0161 0 15.3 0ZM16.2 11.375C16.2 11.6071 16.1052 11.8296 15.9364 11.9937C15.7676 12.1578 15.5387 12.25 15.3 12.25H2.7C2.46131 12.25 2.23239 12.1578 2.0636 11.9937C1.89482 11.8296 1.8 11.6071 1.8 11.375V2.625C1.8 2.39294 1.89482 2.17038 2.0636 2.00628C2.23239 1.84219 2.46131 1.75 2.7 1.75H15.3C15.5387 1.75 15.7676 1.84219 15.9364 2.00628C16.1052 2.17038 16.2 2.39294 16.2 2.625V11.375Z" fill="black"/>
                        </svg>
                        Відео відгуки
                    </Button>
                </div>

                <div className={styles.rewardsBanner}>
                    <Button variant="outline-black" className={styles.bannerLink} onClick={handleVideoReviewClick}>
                        ЗАЛИШАЙТЕ ВІДЕО ВІДГУК І ОТРИМУЙТЕ 100 БАЛІВ
                    </Button>
                </div>
            </div>
            
            <div className={styles.reviewsBlock}>
                <div className={styles.reviewsList}>
                    {reviews.slice(0, visibleCount).map((review) => (
                        <div key={review.id} className={clsx(styles.reviewCard)}>
                            <div className={styles.reviewMain}>
                                <div className={styles.authorAvatar}>
                                    <Image src={review.avatar || "/images/reviews/avatar-1.png"} alt={review.name} width={48} height={48} className={styles.avatarImg} />
                                </div>
                                <div className={styles.reviewContent}>
                                    <div className={styles.reviewHeader}>
                                        <div className={styles.authorMeta}>
                                            <span className={styles.reviewAuthor}>{review.name}</span>
                                            <span className={styles.reviewDate}>{review.date}</span>
                                        </div>
                                        <div className={styles.overallRating}>
                                            {[...Array(5)].map((_, i) => (
                                                <svg
                                                    key={i}
                                                    className={clsx(styles.star, i < review.rating && styles.filled)}
                                                    width="20" height="20" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M16 2.66667L20.12 11.0267L29.3333 12.36L22.6667 18.8533L24.24 28.0267L16 23.6933L7.76 28.0267L9.33333 18.8533L2.66667 12.36L11.88 11.0267L16 2.66667Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className={styles.reviewText}>
                                        <p>{review.text}</p>
                                    </div>

                                    {review.scores && (
                                        <div className={styles.reviewScores}>
                                            {Object.entries(review.scores).map(([key, value]) => (
                                                <div key={key} className={styles.ratingRow}>
                                                    <span className={styles.ratingLabel}>{key}</span>
                                                    <div className={styles.stars}>
                                                        {[...Array(5)].map((_, i) => (
                                                            <svg 
                                                                key={i} 
                                                                className={clsx(styles.star, styles.mini, i < value && styles.filled)}
                                                                width="14" height="14" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                <path d="M16 2.66667L20.12 11.0267L29.3333 12.36L22.6667 18.8533L24.24 28.0267L16 23.6933L7.76 28.0267L9.33333 18.8533L2.66667 12.36L11.88 11.0267L16 2.66667Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.reviewsFooter}>
                    {visibleCount < reviews.length && (
                        <Button 
                            variant="outline-black" 
                            className={styles.showMoreBtn}
                            onClick={showMore}
                        >
                            ПОКАЗАТИ ЩЕ ВІДГУКИ
                        </Button>
                    )}
                    <Button 
                        variant="black" 
                        className={styles.leaveReviewBtn}
                        onClick={() => setIsReviewModalOpen(true)}
                    >
                        ЗАЛИШИТИ СВІЙ ВІДГУК
                    </Button>
                </div>
            </div>

            <div className={styles.mobileRewardsBanner}>
                <Button variant="outline-black" className={styles.mobileBannerLink} onClick={handleVideoReviewClick}>
                    ЗАЛИШАЙТЕ ВІДЕО ВІДГУК І ОТРИМУЙТЕ 100 БАЛІВ
                </Button>
            </div>

            <ReviewModal 
                isOpen={isReviewModalOpen} 
                onClose={() => setIsReviewModalOpen(false)} 
            />
        </div>
    );
};

export default ProductReviews;
