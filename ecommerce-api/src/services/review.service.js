const { Prisma } = require('@prisma/client');
const prisma = require('../lib/prisma');
const {
	NotFoundError,
	ForbiddenError,
	ConflictError
} = require('../utils/errors');

const reviewInclude = {
	user: {
		select: {
			id: true,
			name: true
		}
	}
};

const getProductReviews = async (productId) => {
	const product = await prisma.product.findUnique({
		where: { id: productId },
		select: { id: true }
	});

	if (!product) {
		throw new NotFoundError('Product not found');
	}

	return prisma.review.findMany({
		where: { productId },
		include: reviewInclude,
		orderBy: { createdAt: 'desc' }
	});
};

const createReview = async (userId, productId, rating, comment) => {
	const product = await prisma.product.findUnique({
		where: { id: productId },
		select: { id: true }
	});

	if (!product) {
		throw new NotFoundError('Product not found');
	}

	const deliveredOrderItem = await prisma.orderItem.findFirst({
		where: {
			productId,
			order: {
				userId,
				status: 'delivered'
			}
		},
		select: { id: true }
	});

	if (!deliveredOrderItem) {
		throw new ForbiddenError(
			'You can review a product only after receiving it'
		);
	}

	try {
		return await prisma.review.create({
			data: {
				userId,
				productId,
				rating,
				comment: comment || null
			},
			include: reviewInclude
		});
	} catch (error) {
		if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
			throw new ConflictError(
				'You have already reviewed this product'
			);
		}

		throw error;
	}
};

const deleteReview = async (userId, reviewId) => {
	const [user, review] = await Promise.all([
		prisma.user.findUnique({
			where: { id: userId },
			select: { role: true }
		}),
		prisma.review.findUnique({
			where: { id: reviewId },
			select: { id: true, userId: true }
		})
	]);

	if (!user) {
		throw new NotFoundError('User not found');
	}

	if (!review) {
		throw new NotFoundError('Review not found');
	}

	if (user.role !== 'admin' && review.userId !== userId) {
		throw new ForbiddenError(
			'You are not allowed to delete this review'
		);
	}

	await prisma.review.delete({
		where: { id: reviewId }
	});
};

module.exports = {
	getProductReviews,
	createReview,
	deleteReview
};
