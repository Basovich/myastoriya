# GraphQL Schema Overview

## Queries
| Query | Аргументи | Повертає | Опис |
| :--- | :--- | :--- | :--- |
| `about()` | — | `About` | Страница О нас |
| `blog(id: Int, slug: String)` | `id, slug` | `BlogPost` | Публикация блога |
| `blogSettings()` | — | `BlogSettings` | Настройки страницы блога |
| `blogTypes()` | — | `[BlogType]` | Типы публикаций блога |
| `blogs(typeId: Int, typeSlug: String, search: String, sort: String, limit: Int, page: Int)` | `typeId, typeSlug, search, sort, limit, page` | `BlogPostPagination` | Список публикаций блога |
| `bonusesAccrualHistory(limit: Int, page: Int)` | `limit, page` | `BonusHistoryItemSimplePagination` | История начисления бонусов |
| `bonusesTerms()` | — | `String` | Условия использования балов и дисконта |
| `career()` | — | `Career` | Інформація про кар'єру |
| `catalogSeoMeta()` | — | `SeoMeta` | SEO каталога |
| `categories(parentId: Int, search: String)` | `parentId, search` | `[Category!]!` | Категории |
| `category(id: Int)` | `id` | `Category` | Категория |
| `popularCategories()` | — | `[Category!]!` | Популярные категории |
| `popularProducts(productId: Int, limit: Int, page: Int)` | `productId, limit, page` | `ProductSimplePagination` | Популярные товары |
| `productCostVariants(productId: ID!)` | `productId` | `[ProductCostVariant]` | Варианты цен товара |
| `product(id: Int!)` | `id` | `Product` | Товар |
| `productsByIds(ids: [Int!]!)` | `ids` | `[Product!]!` | Товары по массиву ID |
| `productsCount(search: String, categoryId: Int, state: [FilterState], viewed: Boolean)` | `search, categoryId, state, viewed` | `Int` | Количество товаров соответствующих фильтру |
| `products(categoryId: Int, showcaseId: Int, saleId: Int, recipeId: Int, search: String, saveSearchSentence: Boolean, filter: [FilterState], viewed: Boolean, sort: String, limit: Int, page: Int)` | `categoryId, showcaseId, saleId, recipeId, search, saveSearchSentence, filter, viewed, sort, limit, page` | `ProductSimplePagination` | Товары |
| `searchPopularQueries(search: String, limit: Int)` | `search, limit` | `[String]` | Популярные поисковые запросы |
| `searchProductByBarcode(barcode: String!)` | `barcode` | `Product` | Поиск товара по штрихкоду |
| `showcaseSeoMeta()` | — | `SeoMeta` | SEO Витрин |
| `showcases()` | — | `[Showcase!]!` | Витрины |
| `thermobox()` | — | `Thermobox` | Термобокс |
| `contactCategories()` | — | `[ContactCategory]` | Категорії контактів зі списком контактів |
| `contacts(categoryId: ID, search: String, limit: Int, page: Int)` | `categoryId, search, limit, page` | `ContactSimplePagination` | Контакти ресторанів |
| `discountSteps()` | — | `[DiscountStep]` | Этапы дисконтной программы |
| `loyaltyBarcode()` | — | `String` | Штрихкод для программы лояльности |
| `loyaltyTerms()` | — | `String` | Условия программы лояльности |
| `userDiscountInfo()` | — | `UserDiscountInfo` | Информация о скидке пользователя |
| `userBankCard(id: Int!)` | `id` | `UserBankCard` | Банковская карта пользователя |
| `userBankCardsCount()` | — | `Int!` | Количество карт пользователя |
| `userBankCards()` | — | `[UserBankCard]` | Список карт пользователя |
| `faqGroups(limit: Int, page: Int)` | `limit, page` | `FaqGroupSimplePagination` | Список груп вопросов |
| `faqQuestions(groupId: Int, limit: Int, page: Int)` | `groupId, limit, page` | `FaqQuestionSimplePagination` | Список вопросов и ответов |
| `favorites(limit: Int, page: Int)` | `limit, page` | `ProductSimplePagination` | Избранное |
| `locales()` | — | `[Locale]` |  |
| `mobileTranslatesHash(locale: String)` | `locale` | `String!` | Получение хеша переводов для конкретного языка |
| `mobileTranslates(locale: String!)` | `locale` | `[MobileTranslation]` | Получение переводов для конкретного языка |
| `localities(name: String, primary: Boolean, limit: Int, page: Int)` | `name, primary, limit, page` | `LocalitySimplePagination!` |  |
| `locality(id: Int!)` | `id` | `Locality` |  |
| `selectedLocality()` | — | `Locality` |  |
| `streets(localityId: Int!, name: String, limit: Int, page: Int)` | `localityId, name, limit, page` | `StreetSimplePagination!` | Получить список улиц |
| `warehouse(ref: String!)` | `ref` | `Warehouse` | Отделение Новой Почты |
| `warehouses(localityId: Int, search: String, limit: Int, page: Int)` | `localityId, search, limit, page` | `WarehousePagination` | Список отделений Новой Почты |
| `orderReview(id: Int!)` | `id` | `OrderReview` | Отзыв заказа |
| `orderReviewTypes()` | — | `[OrderReviewType]` | Типы оценок к отзыву заказа |
| `orderReviews(orderId: Int, limit: Int, page: Int)` | `orderId, limit, page` | `OrderReviewSimplePagination` | Отзывы заказа |
| `cart(paymentId: Int, deliveryId: Int, localityId: Int, useBonuses: Boolean)` | `paymentId, deliveryId, localityId, useBonuses` | `Cart` | Корзина пользователя |
| `deliveries(type: String, localityId: Int)` | `type, localityId` | `[Delivery]` | Список доставок |
| `delivery(id: Int!)` | `id` | `Delivery` | Доставка |
| `deliveryTimes(id: Int!, date: String!)` | `id, date` | `[String]` | Желаемое время доставки |
| `order(id: Int!)` | `id` | `Order` | Заказ пользователя |
| `ordersCount()` | — | `Int!` | Количество заказов пользователя |
| `orders(withoutCancelled: Boolean, limit: Int, page: Int)` | `withoutCancelled, limit, page` | `OrderSimplePagination` | Список заказов пользователя |
| `ordersWithoutReviews()` | — | `[ID]` | Список ID завершенных заказов без отзывов |
| `payments(localityId: Int, os: String)` | `localityId, os` | `[Payment]` | Список способов оплаты |
| `quickOrderDeliveryDriver(localityId: Int!)` | `localityId` | `String` | Какой драйвер (способ доставки) использовать при быстром заказе. Возвращает: "nova-poshta-postal" или "courier" |
| `quickOrderSummary(productId: Int!, quantity: Int, costVariantId: Int, localityId: Int, paymentId: Int)` | `productId, quantity, costVariantId, localityId, paymentId` | `QuickOrderSummary` | Итоговое состояние быстрой покупки |
| `rawFoodOnlinePaymentPercent(paymentId: Int!)` | `paymentId` | `Float` | Процент наценки на весовую продукцию при online оплате |
| `page(id: Int)` | `id` | `Page` |  |
| `pages()` | — | `[Page]` |  |
| `contractOffer()` | — | `ContractOffer` | Страница договора оферты |
| `privacyPolicy()` | — | `PrivacyPolicy` | Страница политики конфиденциальности |
| `termsOfUse()` | — | `TermsOfUse` | Страница пользовательского соглашения |
| `orderingInfoBlocks(type: String)` | `type` | `[OrderingInfoBlock!]!` | Блоки доставки и оплаты |
| `productReviewsCount(productId: Int!)` | `productId` | `Int!` | Количество отзывов |
| `productReviews(productId: Int, userId: Int, limit: Int, page: Int)` | `productId, userId, limit, page` | `ProductReviewSimplePagination` | Отзывы товара |
| `RecipeReviews(recipeId: Int, userId: Int, limit: Int, page: Int)` | `recipeId, userId, limit, page` | `RecipeReviewSimplePagination` | Отзывы рецепта |
| `recipeCategories(limit: Int, page: Int)` | `limit, page` | `RecipeCategorySimplePagination` | Категории рецептов |
| `recipeCategory(id: Int!)` | `id` | `RecipeCategory` | Категория рецептов |
| `recipe(id: Int!)` | `id` | `Recipe` | Рецепт |
| `recipeTag(id: Int!)` | `id` | `RecipeTag` | Атрибут рецептов |
| `recipeTags(categoryId: Int, limit: Int, page: Int)` | `categoryId, limit, page` | `RecipeTagSimplePagination` | Атрибуты рецептов |
| `recipesCount()` | — | `Int!` | Количество рецептов |
| `recipes(categoryId: Int, productId: Int, tagId: Int, search: String, sort: String, limit: Int, page: Int)` | `categoryId, productId, tagId, search, sort, limit, page` | `RecipeSimplePagination` | Рецепты |
| `sale(id: Int!)` | `id` | `Sale` | Акция |
| `salesCount()` | — | `Int!` | Количество акций |
| `sales(limit: Int, page: Int)` | `limit, page` | `SaleSimplePagination` | Акции |
| `Setting(key: String)` | `key` | `[String]` | Настройки |
| `shoppingList(id: Int!)` | `id` | `ShoppingList` | Список покупок |
| `shoppingLists(limit: Int, page: Int)` | `limit, page` | `ShoppingListSimplePagination` | Списки покупок |
| `shop(id: Int!)` | `id` | `Shop` | Магазин |
| `shops(onlyCompanyStores: Boolean, onlyWithPickup: Boolean, sort: String, search: String, limit: Int, page: Int)` | `onlyCompanyStores, onlyWithPickup, sort, search, limit, page` | `ShopSimplePagination` | Магазины |
| `slideSwitchTime()` | — | `Int` |  |
| `slides(slide: String)` | `slide` | `[Slide]` |  |
| `socialLinks()` | — | `[SocialLink]` | Социальные сети |
| `special(id: Int!)` | `id` | `Special` | Спецпредложение |
| `specials(productId: Int, limit: Int, page: Int)` | `productId, limit, page` | `SpecialSimplePagination` | Спецпредложения |
| `geocode(lat: Float, lng: Float)` | `lat, lng` | `GeocodedAddress` | Геокодирование координат |
| `userAddress(id: Int!)` | `id` | `UserAddress` | Адрес доставки |
| `userAddressesCount()` | — | `Int!` | Количество адресов доставки пользователя |
| `userAddresses()` | — | `[UserAddress]` | Адреса доставки |
| `userHasUnreadNotifications()` | — | `Boolean` | Есть ли непрочитанные уведомления |
| `userNotifications(limit: Int, page: Int)` | `limit, page` | `UserNotificationSimplePagination` | Уведомления пользователю |
| `userPickupPoint(id: Int!)` | `id` | `UserPickupPoint` | Точка самовывоза пользователя |
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
| `likeBlog(id: Int!)` | `id` | `BlogPost` | Поставить лайк публикации |
| `submitCareerApplication(firstName: String!, lastName: String!, phone: String!, email: String!, message: String)` | `firstName, lastName, phone, email, message` | `CareerApplicationResult` | Надіслати заявку на кар'єру |
| `addProductView(id: ID!)` | `id` | `Boolean` |  |
| `productsFilter(search: String, categoryId: Int, recipeId: Int, viewed: Boolean, state: [FilterState])` | `search, categoryId, recipeId, viewed, state` | `ProductsFilter` | Фильтр товаров |
| `confirmCodeVerification(actionToken: String!, code: String!)` | `actionToken, code` | `Boolean` | Подтверждение платежа СМС кодом |
| `deleteUserBankCard(id: ID!)` | `id` | `Boolean` | Удаление банковской карты пользователя |
| `markUserBankCardAsDefault(id: Int!)` | `id` | `Boolean` | Банковская карта пользователя по умолчанию |
| `orderApplePay(orderId: Int!, token: String!, browserInfo: BrowserInfo)` | `orderId, token, browserInfo` | `FinishPayResponse` | Оплата заказа через Apple Pay |
| `orderGooglePay(orderId: Int!, token: String!, browserInfo: BrowserInfo)` | `orderId, token, browserInfo` | `FinishPayResponse` | Оплата заказа через Google Pay |
| `requestTokenizeCard()` | — | `String` | Создание банковской карты пользователя. В ответе будет url, который нужно открыть в браузере, или null |
| `addToFavoritesFromOrder(orderId: Int!)` | `orderId` | `Boolean` | Добавить в избранное с заказа |
| `addToFavorites(payload: String!)` | `payload` | `Boolean` | Добавить в избранное |
| `removeFromFavorites(payload: String!)` | `payload` | `Boolean` | Удалить из избранного |
| `setUserFcmToken(fcmToken: String!)` | `fcmToken` | `Boolean` | Установить/обновить FCM токен пользователя |
| `autoDetectLocality(lat: Float, lng: Float)` | `lat, lng` | `Locality` | Автоматическое определение города пользователя по координатам. Если не указаны координаты - по IP. |
| `selectLocality(id: Int)` | `id` | `Locality` |  |
| `addOrderReview(orderId: Int!, ratings: [ReviewRating], text: String!)` | `orderId, ratings, text` | `Boolean` |  |
| `addProductToCart(productId: Int!, quantity: Int, costVariantId: Int, paymentId: Int, deliveryId: Int, localityId: Int, useBonuses: Boolean)` | `productId, quantity, costVariantId, paymentId, deliveryId, localityId, useBonuses` | `Cart` | Добавить товар в корзину |
| `createOrder(userData: CheckoutUserData!, deliveryData: CheckoutDeliveryData!, paymentData: CheckoutPaymentData!, useBonuses: Boolean, comment: String, personsCount: Int, communicationMethod: String, dontCallBack: Boolean, registerMe: Boolean, password: String)` | `userData, deliveryData, paymentData, useBonuses, comment, personsCount, communicationMethod, dontCallBack, registerMe, password` | `CreateOrderResponse` | Создать заказ |
| `createQuickOrder(productId: Int!, quantity: Int, costVariantId: Int, localityId: Int!, name: String, userName: String, userSurname: String, phone: String!, street: String, house: String, apartment: Int, warehouse: String, comment: String, personsCount: Int, paymentData: CheckoutPaymentData!)` | `productId, quantity, costVariantId, localityId, name, userName, userSurname, phone, street, house, apartment, warehouse, comment, personsCount, paymentData` | `CreateOrderResponse` | Создать быстрый заказ |
| `editCartItemQuantity(rowId: String!, quantity: Int!, paymentId: Int, deliveryId: Int, localityId: Int, useBonuses: Boolean)` | `rowId, quantity, paymentId, deliveryId, localityId, useBonuses` | `Cart` | Изменить кол-во товара в корзине |
| `removeCartItem(rowId: String!, paymentId: Int, deliveryId: Int, localityId: Int, useBonuses: Boolean)` | `rowId, paymentId, deliveryId, localityId, useBonuses` | `Cart` | Удалить товар с корзины |
| `removeUnavailableCartItems(localityId: Int!)` | `localityId` | `Boolean` | Удалить товар с корзины, которые не доступны к доставке в указзаный населённый пункт |
| `repeatOrder(orderId: ID!)` | `orderId` | `Boolean` | Повторить заказ (добавить товары с заказа в корзину) |
| `userDontWantLeaveOrdersReview()` | — | `Boolean` | Пометить что пользователь не хочет оставлять отзывы об завершенных заказах без отзывов |
| `addProductReview(productId: Int!, rating: Int!, text: String!)` | `productId, rating, text` | `Boolean` |  |
| `applyPromoCode(code: String!, paymentId: Int, deliveryId: Int, localityId: Int, useBonuses: Boolean)` | `code, paymentId, deliveryId, localityId, useBonuses` | `Cart` | Применить промокод |
| `cancelCartPromoCode(paymentId: Int, deliveryId: Int, localityId: Int, useBonuses: Boolean)` | `paymentId, deliveryId, localityId, useBonuses` | `Cart` | Отменить промокод |
| `addRecipeReview(recipeId: Int!, rating: Int!, text: String!)` | `recipeId, rating, text` | `Boolean` |  |
| `addRecipeView(id: Int!)` | `id` | `Boolean` |  |
| `addCartProductsToShoppingList(id: ID!)` | `id` | `Boolean` |  |
| `addOrderProductsToShoppingList(id: ID!, orderId: ID!)` | `id, orderId` | `Boolean` |  |
| `addProductToShoppingList(id: ID!, productId: ID!, costVariantId: ID)` | `id, productId, costVariantId` | `Boolean` |  |
| `addShoppingListToCart(id: ID!)` | `id` | `Boolean` | Добавить все товары списка покупок в корзину |
| `createShoppingList(name: String)` | `name` | `ShoppingList` |  |
| `deleteProductFromShoppingList(id: ID!)` | `id` | `Boolean` |  |
| `deleteShoppingList(id: ID!)` | `id` | `Boolean` |  |
| `moveProductToAnotherShoppingList(id: ID!, shoppingListId: Int!)` | `id, shoppingListId` | `Boolean` |  |
| `renameShoppingList(id: ID!, name: String!)` | `id, name` | `Boolean` |  |
| `subscribe(email: String!)` | `email` | `Boolean!` | Подписаться на рассылку |
| `addProductToAvailabilityTracker(productId: Int!)` | `productId` | `Boolean` | Добавить товар в список "Сообщить о наличии" |
| `deleteProductFromAvailabilityTracker(productId: Int!)` | `productId` | `Boolean` |  |
| `createUserAddress(isDefault: Boolean, city: String!, streetId: Int, street: String, house: String!, apartment: Int, entrance: Int, floor: Int)` | `isDefault, city, streetId, street, house, apartment, entrance, floor` | `UserAddress` | Создание адреса доставки |
| `deleteUserAddress(id: ID!)` | `id` | `Boolean` | Удалить адрес доставки |
| `markUserAddressAsDefault(id: Int!)` | `id` | `Boolean` | Адрес доставки по умолчанию |
| `updateUserAddress(id: Int!, isDefault: Boolean, city: String!, streetId: Int, street: String, house: String!, apartment: Int, entrance: Int, floor: Int)` | `id, isDefault, city, streetId, street, house, apartment, entrance, floor` | `Boolean` | Обновление адреса доставки |
| `startCheckout()` | — | `Boolean` | Начало оформления заказа |
| `addUserPickupPoint(type: String!, key: String!)` | `type, key` | `UserPickupPoint` | Добавить точку самовывоза к пользователю |
| `deleteUserPickupPoint(id: Int!)` | `id` | `Boolean` | Удалить пункт самовывоза с пользователя |
| `markUserPickupPointAsDefault(id: Int!)` | `id` | `Boolean` | Адрес самовывоза по умолчанию |
| `updateUserPickupPoint(id: Int!, key: String!)` | `id, key` | `Boolean` | A mutation |
| `authAsGuest(deviceId: String!)` | `deviceId` | `AuthFields` |  |
| `deleteUser()` | — | `Boolean` | Удаление пользователя |
| `login(phone: String!, password: String!)` | `phone, password` | `LoggedInUser` |  |
| `logout()` | — | `Boolean` |  |
| `refreshToken(refreshToken: String!)` | `refreshToken` | `AuthFields` |  |
| `registration(deviceId: String, name: String!, surname: String!, phone: String!, email: String, password: String!, actionToken: String!)` | `deviceId, name, surname, phone, email, password, actionToken` | `LoggedInUser` | Регистрация пользователя |
| `resetPassword(phone: String!, password: String!, actionToken: String!)` | `phone, password, actionToken` | `Boolean` | Восстановление пароля |
| `smsVerify(token: String!, code: Int!)` | `token, code` | `ActionToken` |  |
| `sendSMS(phone: String!)` | `phone` | `SMSToken` |  |
| `socialAuth(deviceId: String, provider: String!, code: String!)` | `deviceId, provider, code` | `LoggedInUser` |  |
| `updateCheckoutUserData(name: String!, surname: String!, phone: String!, email: String)` | `name, surname, phone, email` | `User` | Обновление данных пользователя и гостя на странице оформления заказа |
| `updateGuestData(name: String!, surname: String!, phone: String!, email: String)` | `name, surname, phone, email` | `User` | Обновление данных гостя |
| `updateUserAvatar(avatar: Upload!)` | `avatar` | `User` | Обновление аватара пользователя |
| `updateUserData(name: String!, surname: String!, phone: String!, email: String, birthday: String, sex: String!, password: String)` | `name, surname, phone, email, birthday, sex, password` | `User` | Обновление данных пользователя |
| `updateUserLocale(locale: String!)` | `locale` | `User` | Обновить локализацию пользователя |
| `updateUserReceiveEmailNotifications(enable: Boolean!)` | `enable` | `User` | Включить / выключить рассылку по email для пользователя |
| `updateUserReceivePushNotifications(enable: Boolean!)` | `enable` | `User` | Включить / выключить уведомления приложения для пользователя |
