use sea_orm::ActiveValue::Set;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, IntoActiveModel, QueryFilter};

use crate::model::result::{Error, Result};
use crate::model::user::{Column, CreateUser, Entity, Model as User, UpdateUser};
use crate::repository::Pool;

pub async fn find(open_id: &str) -> Result<User> {
    let result: Option<User> = Entity::find()
        .filter(Column::OpenId.eq(open_id))
        .one(Pool::get("default"))
        .await
        .map_err(|e| {
            println!("查询用户失败: {:?}", e);

            Error::Database
        })?;

    if let Some(user) = result {
        return Ok(user);
    }

    Err(Error::UserNotFound)
}

pub async fn insert(user: CreateUser) -> Result<User> {
    user.into_active_model()
        .insert(Pool::get("default"))
        .await
        .map_err(|e| {
            println!("插入用户失败: {:?}", e);

            Error::DatabaseInsert
        })
}

pub async fn update(model: User, updated: UpdateUser) -> Result<User> {
    let mut active_model = updated.into_active_model();

    active_model.id = Set(model.id);

    active_model
        .update(Pool::get("default"))
        .await
        .map_err(|e| {
            println!("更新用户失败: {:?}", e);

            Error::DatabaseUpdate
        })
}
