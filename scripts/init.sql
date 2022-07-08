CREATE SCHEMA `browser-events` DEFAULT CHARACTER SET utf8mb4 ;

CREATE TABLE `browser-events`.`events` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(45) NOT NULL,
  `data` TEXT NOT NULL,
  `time` BIGINT NOT NULL,
  `duration` INT NOT NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `browser-events`.`events` 
ADD COLUMN `page_last` INT(1) NOT NULL DEFAULT 0 AFTER `duration`;

ALTER TABLE `browser-events`.`events` 
ADD COLUMN `session` BIGINT NOT NULL AFTER `page_last`,
CHANGE COLUMN `duration` `duration` INT(11) NOT NULL DEFAULT 0 ;

ALTER TABLE `browser-events`.`events` 
CHANGE COLUMN `session` `session` VARCHAR(45) NOT NULL ;

CREATE TABLE `browser-events`.`key_elements` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `page_url` VARCHAR(200) NOT NULL,
  `xpath` VARCHAR(200) NOT NULL,
  PRIMARY KEY (`id`));

ALTER TABLE `browser-events`.`key_elements` 
ADD COLUMN `type` VARCHAR(45) NOT NULL AFTER `xpath`;

ALTER TABLE `browser-events`.`events` 
ADD COLUMN `key_el_id` INT NULL AFTER `session`;

ALTER TABLE `browser-events`.`events` 
ADD COLUMN `remark` VARCHAR(100) NULL AFTER `key_el_id`;


insert into key_elements (`page_url`, `xpath`, `type`)
values ('https://www.apple.com/jp/shop/buy-ipad/ipad-10-2/[^-]+-[^-]+-[^-]+', '//*[@class="rf-flagship-engraving"]/*[not(contains(@class, "rf-engraving-disabled"))]//input[@data-autom="noEngraving-app"]/../label', 'button'),
('https://www.apple.com/jp/shop/buy-ipad/ipad-10-2/[^-]+-[^-]+-[^-]+', '//button[@data-autom="add-to-cart"]', 'button'),
('https://www.apple.com/jp/shop/buy-ipad/ipad-10-2\\?product=[^\\?=&]+&purchaseOption=[^\\?=&]+&step=[^\\?=&]+', '//button[@data-autom="proceed"]', 'button'),
('https://www.apple.com/jp/shop/bag', '//button[@data-autom="checkout"]', 'button'),
('https://secure\\d+.store.apple.com/jp/shop/signIn\\?ssi=', '//button[@data-autom="guest-checkout-btn"]', 'button'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Fulfillment-init', '//input[@value="RETAIL"]/../label', 'button'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Fulfillment-init', '//input[@id="checkout.fulfillment.pickupTab.pickup.storeLocator.searchInput"]', 'input2'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Fulfillment-init', '//button[@data-autom="fulfillment-pickup-store-search-button"]', 'button'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Fulfillment-init', '//button[@data-autom="show-more-stores-button"]', 'button'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Fulfillment-init', '//li[@class="form-selector"]/input[not(@disabled)]/..//span[@class="form-selector-title"]', 'button'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Fulfillment-init', '//button[@data-autom="fulfillment-continue-button" and not(@disabled)]', 'button'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=PickupContact-init', '(//input[@data-autom="form-field-lastName"])[1]', 'input'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=PickupContact-init', '(//input[@data-autom="form-field-firstName"])[1]', 'input'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=PickupContact-init', '(//input[@data-autom="form-field-emailAddress"])[1]', 'input'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=PickupContact-init', '(//input[@data-autom="form-field-mobilePhone"])[1]', 'input'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=PickupContact-init', '//button[@id="rs-checkout-continue-button-bottom" and not(@disabled)]', 'button'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Billing-init', '//button[@data-autom="enter-giftcard-number"]', 'button'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Billing-init', '//input[@data-autom="gift-card-pin"]', 'input'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Billing-init', '//button[@data-autom="gift-card-apply"]', 'button'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Billing-init', '//input[@data-autom="form-field-lastName"]', 'input'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Billing-init', '//input[@data-autom="form-field-firstName"]', 'input'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Billing-init', '//select[@data-autom="form-field-state"]', 'select'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Billing-init', '//input[@data-autom="form-field-city"]', 'input'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Billing-init', '//input[@data-autom="form-field-street"]', 'input'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Billing-init', '//input[@data-autom="form-field-street2"]', 'input'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Billing-init', '//button[@data-autom="continue-button-label" and not(@disabled)]', 'button'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Review', '//button[@id="rs-checkout-continue-button-bottom" and not(@disabled)]', 'button'),
('https://secure\\d+.store.apple.com/jp/shop/checkout\\?_s=Fulfillment$', '//h2[@class="rs-fulfillment-sectiontitle"]', 'button');