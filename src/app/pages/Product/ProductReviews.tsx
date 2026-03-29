import React, { useState } from 'react';
import clsx from 'clsx';
import styles from './Product.module.scss';
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
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12zM7 9h10v2H7zm0-3h10v2H7zm0 6h7v2H7z"/>
                        </svg>
                        Відгуки
                    </Button>
                    <Button 
                        variant={activeTab === 'video' ? 'black' : 'outline-black'}
                        className={clsx(styles.reviewTabBtn, activeTab === 'video' && styles.active)}
                        onClick={() => setActiveTab('video')}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4zM15 16H5V8h10v8zm-6-1l3-3-3-3v6z"/>
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
                        <div key={review.id} className={styles.reviewCard}>
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
                <Button variant="outline-black" className={styles.bannerLink} onClick={handleVideoReviewClick}>
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
