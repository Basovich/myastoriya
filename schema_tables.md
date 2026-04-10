# GraphQL Schema Overview

## Queries
| Query | Аргументи | Повертає | Опис |
| :--- | :--- | :--- | :--- |
| `about()` | — | `About` | Страница О нас |
| `blog(id: Int, slug: String)` | `id, slug` | `BlogPost` | Публикация блога |
| `blogSettings()` | — | `BlogSettings` | Настройки страницы блога |
| `blogTypes()` | — | `[BlogType]` | Типы публикаций блога |
| `blogs(typeId: Int, typeSlug: String, search: String, sort: String, limit: Int, page: Int)` | `typeId, typeSlug, search, sort, limit, page` | `BlogPostSimplePagination` | Список публикаций блога |
| `bonusesAccrualHistory(limit: Int, page: Int)` | `limit, page` | `BonusHistoryItemSimplePagination` | История начисления бонусов |
| `bonusesTerms()` | — | `String` | Условия использования балов и дисконта |
| `career()` | — | `Career` | Інформація про кар'єру |
| `catalogSeoMeta()` | — | `SeoMeta` | SEO каталога |
| `categories(parentId: Int, search: String)` | `parentId, search` | `[Unknown]!` | Категории |
| `category(id: Int)` | `id` | `Category` | Категория |
| `popularCategories()` | — | `[Unknown]!` | Популярные категории |
| `popularProducts(productId: Int, limit: Int, page: Int)` | `productId, limit, page` | `ProductSimplePagination` | Популярные товары |
| `productCostVariants(productId: Unknown!)` | `productId` | `[ProductCostVariant]` | Варианты цен товара |
| `product(id: Unknown!)` | `id` | `Product` | Товар |
| `productsCount(search: String, categoryId: Int, state: [Unknown], viewed: Boolean)` | `search, categoryId, state, viewed` | `Int` | Количество товаров соответствующих фильтру |
| `products(categoryId: Int, showcaseId: Int, saleId: Int, recipeId: Int, search: String, saveSearchSentence: Boolean, filter: [Unknown], viewed: Boolean, sort: String, limit: Int, page: Int)` | `categoryId, showcaseId, saleId, recipeId, search, saveSearchSentence, filter, viewed, sort, limit, page` | `ProductSimplePagination` | Товары |
| `searchPopularQueries(search: String, limit: Int)` | `search, limit` | `[String]` | Популярные поисковые запросы |
| `searchProductByBarcode(barcode: Unknown!)` | `barcode` | `Product` | Поиск товара по штрихкоду |
| `showcaseSeoMeta()` | — | `SeoMeta` | SEO Витрин |
| `showcases()` | — | `[Unknown]!` | Витрины |
| `thermobox()` | — | `Thermobox` | Термобокс |
| `discountSteps()` | — | `[DiscountStep]` | Этапы дисконтной программы |
| `loyaltyBarcode()` | — | `String` | Штрихкод для программы лояльности |
| `loyaltyTerms()` | — | `String` | Условия программы лояльности |
| `userDiscountInfo()` | — | `UserDiscountInfo` | Информация о скидке пользователя |
| `userBankCard(id: Unknown!)` | `id` | `UserBankCard` | Банковская карта пользователя |
| `userBankCardsCount()` | — | `Int!` | Количество карт пользователя |
| `userBankCards()` | — | `[UserBankCard]` | Список карт пользователя |
| `faqGroups(limit: Int, page: Int)` | `limit, page` | `FaqGroupSimplePagination` | Список груп вопросов |
| `faqQuestions(groupId: Int, limit: Int, page: Int)` | `groupId, limit, page` | `FaqQuestionSimplePagination` | Список вопросов и ответов |
| `favorites(limit: Int, page: Int)` | `limit, page` | `ProductSimplePagination` | Избранное |
| `locales()` | — | `[Locale]` |  |
| `mobileTranslatesHash(locale: String)` | `locale` | `String!` | Получение хеша переводов для конкретного языка |
| `mobileTranslates(locale: Unknown!)` | `locale` | `[MobileTranslation]` | Получение переводов для конкретного языка |
| `localities(name: String, primary: Boolean, limit: Int, page: Int)` | `name, primary, limit, page` | `LocalitySimplePagination!` |  |
| `locality(id: Unknown!)` | `id` | `Locality` |  |
| `selectedLocality()` | — | `Locality` |  |
| `streets(localityId: Unknown!, name: String, limit: Int, page: Int)` | `localityId, name, limit, page` | `StreetSimplePagination!` | Получить список улиц |
| `warehouse(ref: Unknown!)` | `ref` | `Warehouse` | Отделение Новой Почты |
| `warehouses(localityId: Int, search: String, limit: Int, page: Int)` | `localityId, search, limit, page` | `WarehousePagination` | Список отделений Новой Почты |
| `orderReview(id: Unknown!)` | `id` | `OrderReview` | Отзыв заказа |
| `orderReviewTypes()` | — | `[OrderReviewType]` | Типы оценок к отзыву заказа |
| `orderReviews(orderId: Int, limit: Int, page: Int)` | `orderId, limit, page` | `OrderReviewSimplePagination` | Отзывы заказа |
| `cart(paymentId: Int, deliveryId: Int, localityId: Int, useBonuses: Boolean)` | `paymentId, deliveryId, localityId, useBonuses` | `Cart` | Корзина пользователя |
| `deliveries(type: String, localityId: Int)` | `type, localityId` | `[Delivery]` | Список доставок |
| `delivery(id: Unknown!)` | `id` | `Delivery` | Доставка |
| `deliveryTimes(id: Unknown!, date: Unknown!)` | `id, date` | `[String]` | Желаемое время доставки |
| `order(id: Unknown!)` | `id` | `Order` | Заказ пользователя |
| `ordersCount()` | — | `Int!` | Количество заказов пользователя |
| `orders(withoutCancelled: Boolean, limit: Int, page: Int)` | `withoutCancelled, limit, page` | `OrderSimplePagination` | Список заказов пользователя |
| `ordersWithoutReviews()` | — | `[ID]` | Список ID завершенных заказов без отзывов |
| `payments(localityId: Int, os: String)` | `localityId, os` | `[Payment]` | Список способов оплаты |
| `quickOrderDeliveryDriver(localityId: Unknown!)` | `localityId` | `String` | Какой драйвер (способ доставки) использовать при быстром заказе. Возвращает: "nova-poshta-postal" или "courier" |
| `quickOrderSummary(productId: Unknown!, quantity: Int, costVariantId: Int, localityId: Int, paymentId: Int)` | `productId, quantity, costVariantId, localityId, paymentId` | `QuickOrderSummary` | Итоговое состояние быстрой покупки |
| `rawFoodOnlinePaymentPercent(paymentId: Unknown!)` | `paymentId` | `Float` | Процент наценки на весовую продукцию при online оплате |
| `page(id: Int)` | `id` | `Page` |  |
| `pages()` | — | `[Page]` |  |
| `contractOffer()` | — | `ContractOffer` | Страница договора оферты |
| `privacyPolicy()` | — | `PrivacyPolicy` | Страница политики конфиденциальности |
| `termsOfUse()` | — | `TermsOfUse` | Страница пользовательского соглашения |
| `orderingInfoBlocks(type: String)` | `type` | `[Unknown]!` | Блоки доставки и оплаты |
| `productReviewsCount(productId: Unknown!)` | `productId` | `Int!` | Количество отзывов |
| `productReviews(productId: Int, userId: Int, limit: Int, page: Int)` | `productId, userId, limit, page` | `ProductReviewSimplePagination` | Отзывы товара |
| `RecipeReviews(recipeId: Int, userId: Int, limit: Int, page: Int)` | `recipeId, userId, limit, page` | `RecipeReviewSimplePagination` | Отзывы рецепта |
| `recipeCategories(limit: Int, page: Int)` | `limit, page` | `RecipeCategorySimplePagination` | Категории рецептов |
| `recipeCategory(id: Unknown!)` | `id` | `RecipeCategory` | Категория рецептов |
| `recipe(id: Unknown!)` | `id` | `Recipe` | Рецепт |
| `recipeTag(id: Unknown!)` | `id` | `RecipeTag` | Атрибут рецептов |
| `recipeTags(categoryId: Int, limit: Int, page: Int)` | `categoryId, limit, page` | `RecipeTagSimplePagination` | Атрибуты рецептов |
| `recipesCount()` | — | `Int!` | Количество рецептов |
| `recipes(categoryId: Int, productId: Int, tagId: Int, search: String, sort: String, limit: Int, page: Int)` | `categoryId, productId, tagId, search, sort, limit, page` | `RecipeSimplePagination` | Рецепты |
| `sale(id: Unknown!)` | `id` | `Sale` | Акция |
| `salesCount()` | — | `Int!` | Количество акций |
| `sales(limit: Int, page: Int)` | `limit, page` | `SaleSimplePagination` | Акции |
| `Setting(key: String)` | `key` | `[String]` | Настройки |
| `shoppingList(id: Unknown!)` | `id` | `ShoppingList` | Список покупок |
| `shoppingLists(limit: Int, page: Int)` | `limit, page` | `ShoppingListSimplePagination` | Списки покупок |
| `shop(id: Unknown!)` | `id` | `Shop` | Магазин |
| `shops(onlyCompanyStores: Boolean, onlyWithPickup: Boolean, sort: String, search: String, limit: Int, page: Int)` | `onlyCompanyStores, onlyWithPickup, sort, search, limit, page` | `ShopSimplePagination` | Магазины |
| `slideSwitchTime()` | — | `Int` |  |
| `slides(slide: String)` | `slide` | `[Slide]` |  |
| `socialLinks()` | — | `[SocialLink]` | Социальные сети |
| `special(id: Unknown!)` | `id` | `Special` | Спецпредложение |
| `specials(productId: Int, limit: Int, page: Int)` | `productId, limit, page` | `SpecialSimplePagination` | Спецпредложения |
| `geocode(lat: Float, lng: Float)` | `lat, lng` | `GeocodedAddress` | Геокодирование координат |
| `userAddress(id: Unknown!)` | `id` | `UserAddress` | Адрес доставки |
| `userAddressesCount()` | — | `Int!` | Количество адресов доставки пользователя |
| `userAddresses()` | — | `[UserAddress]` | Адреса доставки |
| `userHasUnreadNotifications()` | — | `Boolean` | Есть ли непрочитанные уведомления |
| `userNotifications(limit: Int, page: Int)` | `limit, page` | `UserNotificationSimplePagination` | Уведомления пользователю |
| `userPickupPoint(id: Unknown!)` | `id` | `UserPickupPoint` | Точка самовывоза пользователя |
| `userPickupPointsCount(type: String)` | `type` | `Int` | Количество точек самовывоза пользователя |
| `userPickupPoints(type: String)` | `type` | `[UserPickupPoint]` | Точки самовывоза пользователя |
| `aboutPersonalCabinet()` | — | `String` |  |
| `checkUserEmail(email: String)` | `email` | `Boolean` | Проверка существования пользователя с указанным email |
| `checkUserPhone(phone: String)` | `phone` | `Boolean` | Проверка существования пользователя с указанным телефоном |
| `user()` | — | `User` |  |

## Mutations
| Mutation | Аргументи | Повертає | Опис |
| :--- | :--- | :--- | :--- |
| `updateUserMoveCount(id: Int)` | `id` | `Boolean` |  |
| `likeBlog(id: Unknown!)` | `id` | `BlogPost` | Поставить лайк публикации |
| `submitCareerApplication(firstName: Unknown!, lastName: Unknown!, phone: Unknown!, email: Unknown!, message: String)` | `firstName, lastName, phone, email, message` | `CareerApplicationResult` | Надіслати заявку на кар'єру |
| `addProductView(id: Unknown!)` | `id` | `Boolean` |  |
| `productsFilter(search: String, categoryId: Int, recipeId: Int, viewed: Boolean, state: [Unknown])` | `search, categoryId, recipeId, viewed, state` | `ProductsFilter` | Фильтр товаров |
| `confirmCodeVerification(actionToken: Unknown!, code: Unknown!)` | `actionToken, code` | `Boolean` | Подтверждение платежа СМС кодом |
| `deleteUserBankCard(id: Unknown!)` | `id` | `Boolean` | Удаление банковской карты пользователя |
| `markUserBankCardAsDefault(id: Unknown!)` | `id` | `Boolean` | Банковская карта пользователя по умолчанию |
| `orderApplePay(orderId: Unknown!, token: Unknown!, browserInfo: BrowserInfo)` | `orderId, token, browserInfo` | `FinishPayResponse` | Оплата заказа через Apple Pay |
| `orderGooglePay(orderId: Unknown!, token: Unknown!, browserInfo: BrowserInfo)` | `orderId, token, browserInfo` | `FinishPayResponse` | Оплата заказа через Google Pay |
| `requestTokenizeCard()` | — | `String` | Создание банковской карты пользователя. В ответе будет url, который нужно открыть в браузере, или null |
| `addToFavoritesFromOrder(orderId: Unknown!)` | `orderId` | `Boolean` | Добавить в избранное с заказа |
| `addToFavorites(payload: Unknown!)` | `payload` | `Boolean` | Добавить в избранное |
| `removeFromFavorites(payload: Unknown!)` | `payload` | `Boolean` | Удалить из избранного |
| `setUserFcmToken(fcmToken: Unknown!)` | `fcmToken` | `Boolean` | Установить/обновить FCM токен пользователя |
| `autoDetectLocality(lat: Float, lng: Float)` | `lat, lng` | `Locality` | Автоматическое определение города пользователя по координатам. Если не указаны координаты - по IP. |
| `selectLocality(id: Int)` | `id` | `Locality` |  |
| `addOrderReview(orderId: Unknown!, ratings: [Unknown], text: Unknown!)` | `orderId, ratings, text` | `Boolean` |  |
| `addProductToCart(productId: Unknown!, quantity: Int, costVariantId: Int, paymentId: Int, deliveryId: Int, localityId: Int, useBonuses: Boolean)` | `productId, quantity, costVariantId, paymentId, deliveryId, localityId, useBonuses` | `Cart` | Добавить товар в корзину |
| `createOrder(userData: Unknown!, deliveryData: Unknown!, paymentData: Unknown!, useBonuses: Boolean, comment: String, personsCount: Int, communicationMethod: String, dontCallBack: Boolean, registerMe: Boolean, password: String)` | `userData, deliveryData, paymentData, useBonuses, comment, personsCount, communicationMethod, dontCallBack, registerMe, password` | `CreateOrderResponse` | Создать заказ |
| `createQuickOrder(productId: Unknown!, quantity: Int, costVariantId: Int, localityId: Unknown!, name: String, userName: String, userSurname: String, phone: Unknown!, street: String, house: String, apartment: Int, warehouse: String, comment: String, personsCount: Int, paymentData: Unknown!)` | `productId, quantity, costVariantId, localityId, name, userName, userSurname, phone, street, house, apartment, warehouse, comment, personsCount, paymentData` | `CreateOrderResponse` | Создать быстрый заказ |
| `editCartItemQuantity(rowId: Unknown!, quantity: Unknown!, paymentId: Int, deliveryId: Int, localityId: Int, useBonuses: Boolean)` | `rowId, quantity, paymentId, deliveryId, localityId, useBonuses` | `Cart` | Изменить кол-во товара в корзине |
| `removeCartItem(rowId: Unknown!, paymentId: Int, deliveryId: Int, localityId: Int, useBonuses: Boolean)` | `rowId, paymentId, deliveryId, localityId, useBonuses` | `Cart` | Удалить товар с корзины |
| `removeUnavailableCartItems(localityId: Unknown!)` | `localityId` | `Boolean` | Удалить товар с корзины, которые не доступны к доставке в указзаный населённый пункт |
| `repeatOrder(orderId: Unknown!)` | `orderId` | `Boolean` | Повторить заказ (добавить товары с заказа в корзину) |
| `userDontWantLeaveOrdersReview()` | — | `Boolean` | Пометить что пользователь не хочет оставлять отзывы об завершенных заказах без отзывов |
| `addProductReview(productId: Unknown!, rating: Unknown!, text: Unknown!)` | `productId, rating, text` | `Boolean` |  |
| `applyPromoCode(code: Unknown!, paymentId: Int, deliveryId: Int, localityId: Int, useBonuses: Boolean)` | `code, paymentId, deliveryId, localityId, useBonuses` | `Cart` | Применить промокод |
| `cancelCartPromoCode(paymentId: Int, deliveryId: Int, localityId: Int, useBonuses: Boolean)` | `paymentId, deliveryId, localityId, useBonuses` | `Cart` | Отменить промокод |
| `addRecipeReview(recipeId: Unknown!, rating: Unknown!, text: Unknown!)` | `recipeId, rating, text` | `Boolean` |  |
| `addRecipeView(id: Unknown!)` | `id` | `Boolean` |  |
| `addCartProductsToShoppingList(id: Unknown!)` | `id` | `Boolean` |  |
| `addOrderProductsToShoppingList(id: Unknown!, orderId: Unknown!)` | `id, orderId` | `Boolean` |  |
| `addProductToShoppingList(id: Unknown!, productId: Unknown!, costVariantId: ID)` | `id, productId, costVariantId` | `Boolean` |  |
| `addShoppingListToCart(id: Unknown!)` | `id` | `Boolean` | Добавить все товары списка покупок в корзину |
| `createShoppingList(name: String)` | `name` | `ShoppingList` |  |
| `deleteProductFromShoppingList(id: Unknown!)` | `id` | `Boolean` |  |
| `deleteShoppingList(id: Unknown!)` | `id` | `Boolean` |  |
| `moveProductToAnotherShoppingList(id: Unknown!, shoppingListId: Unknown!)` | `id, shoppingListId` | `Boolean` |  |
| `renameShoppingList(id: Unknown!, name: Unknown!)` | `id, name` | `Boolean` |  |
| `addProductToAvailabilityTracker(productId: Unknown!)` | `productId` | `Boolean` | Добавить товар в список "Сообщить о наличии" |
| `deleteProductFromAvailabilityTracker(productId: Unknown!)` | `productId` | `Boolean` |  |
| `createUserAddress(isDefault: Boolean, city: Unknown!, streetId: Int, street: String, house: Unknown!, apartment: Int, entrance: Int, floor: Int)` | `isDefault, city, streetId, street, house, apartment, entrance, floor` | `UserAddress` | Создание адреса доставки |
| `deleteUserAddress(id: Unknown!)` | `id` | `Boolean` | Удалить адрес доставки |
| `markUserAddressAsDefault(id: Unknown!)` | `id` | `Boolean` | Адрес доставки по умолчанию |
| `updateUserAddress(id: Unknown!, isDefault: Boolean, city: Unknown!, streetId: Int, street: String, house: Unknown!, apartment: Int, entrance: Int, floor: Int)` | `id, isDefault, city, streetId, street, house, apartment, entrance, floor` | `Boolean` | Обновление адреса доставки |
| `startCheckout()` | — | `Boolean` | Начало оформления заказа |
| `addUserPickupPoint(type: Unknown!, key: Unknown!)` | `type, key` | `UserPickupPoint` | Добавить точку самовывоза к пользователю |
| `deleteUserPickupPoint(id: Unknown!)` | `id` | `Boolean` | Удалить пункт самовывоза с пользователя |
| `markUserPickupPointAsDefault(id: Unknown!)` | `id` | `Boolean` | Адрес самовывоза по умолчанию |
| `updateUserPickupPoint(id: Unknown!, key: Unknown!)` | `id, key` | `Boolean` | A mutation |
| `authAsGuest(deviceId: Unknown!)` | `deviceId` | `AuthFields` |  |
| `deleteUser()` | — | `Boolean` | Удаление пользователя |
| `login(phone: Unknown!, password: Unknown!)` | `phone, password` | `LoggedInUser` |  |
| `logout()` | — | `Boolean` |  |
| `refreshToken(refreshToken: Unknown!)` | `refreshToken` | `AuthFields` |  |
| `registration(deviceId: String, name: Unknown!, surname: Unknown!, phone: Unknown!, email: String, password: Unknown!, actionToken: Unknown!)` | `deviceId, name, surname, phone, email, password, actionToken` | `LoggedInUser` | Регистрация пользователя |
| `resetPassword(phone: Unknown!, password: Unknown!, actionToken: Unknown!)` | `phone, password, actionToken` | `Boolean` | Восстановление пароля |
| `smsVerify(token: Unknown!, code: Unknown!)` | `token, code` | `ActionToken` |  |
| `sendSMS(phone: Unknown!)` | `phone` | `SMSToken` |  |
| `socialAuth(deviceId: String, provider: Unknown!, code: Unknown!)` | `deviceId, provider, code` | `LoggedInUser` |  |
| `updateCheckoutUserData(name: Unknown!, surname: Unknown!, phone: Unknown!, email: String)` | `name, surname, phone, email` | `User` | Обновление данных пользователя и гостя на странице оформления заказа |
| `updateGuestData(name: Unknown!, surname: Unknown!, phone: Unknown!, email: String)` | `name, surname, phone, email` | `User` | Обновление данных гостя |
| `updateUserAvatar(avatar: Unknown!)` | `avatar` | `User` | Обновление аватара пользователя |
| `updateUserData(name: Unknown!, surname: Unknown!, phone: Unknown!, email: String, birthday: String, sex: Unknown!, password: String)` | `name, surname, phone, email, birthday, sex, password` | `User` | Обновление данных пользователя |
| `updateUserLocale(locale: Unknown!)` | `locale` | `User` | Обновить локализацию пользователя |
| `updateUserReceiveEmailNotifications(enable: Unknown!)` | `enable` | `User` | Включить / выключить рассылку по email для пользователя |
| `updateUserReceivePushNotifications(enable: Unknown!)` | `enable` | `User` | Включить / выключить уведомления приложения для пользователя |
