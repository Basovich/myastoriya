import React from 'react';
import clsx from 'clsx';
import styles from './Product.module.scss';
import Button from '@/app/components/ui/Button/Button';

interface Review {
    id: string;
    author: string;
    date: string;
    text: string;
    scores: Record<string, number>;
}

interface ProductReviewsProps {
    reviews: Review[];
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ reviews }) => {
    return (
        <div className={styles.reviewsSection} id="reviews">
            <div className={styles.reviewsHeader}>
                <h2 className={styles.sectionTitle}>Відгуки наших клієнтів</h2>
            </div>
            
            <div className={styles.reviewsList}>
                {reviews.map((review) => (
                    <div key={review.id} className={styles.reviewCard}>
                        <div className={styles.reviewTop}>
                            <div className={styles.authorAvatar}>
                                {review.author.charAt(0)}
                            </div>
                            <div className={styles.authorInfo}>
                                <span className={styles.reviewAuthor}>{review.author}</span>
                                <span className={styles.reviewDate}>{review.date}</span>
                            </div>
                        </div>
                        <div className={styles.reviewContent}>
                            <p>{review.text}</p>
                        </div>
                        <div className={styles.reviewScores}>
                            {Object.entries(review.scores).map(([key, value]) => (
                                <div key={key} className={styles.scoreItem}>
                                    <span className={styles.scoreKey}>{key}</span>
                                    <div className={styles.stars}>
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className={clsx(styles.star, i < value && styles.filled)}>★</span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className={styles.reviewsFooter}>
                <Button variant="outline-black">Показати всі відгуки</Button>
                <Button variant="primary">Написати відгук</Button>
            </div>
        </div>
    );
};

export default ProductReviews;
