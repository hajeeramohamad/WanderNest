package com.wandernest.WanderNest.service.interfac;

import com.wandernest.WanderNest.dto.LoginRequest;
import com.wandernest.WanderNest.dto.Response;
import com.wandernest.WanderNest.entity.User;

public interface IUserService {
    Response register(User user);

    Response login(LoginRequest loginRequest);

    Response getAllUsers();

    Response getUserBookingHistory(String userId);

    Response deleteUser(String userId);

    Response getUserById(String userId);

    Response getMyInfo(String email);

}
